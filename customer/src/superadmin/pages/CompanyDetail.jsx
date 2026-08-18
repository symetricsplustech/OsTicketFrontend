import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, formatCurrency, formatDate } from '../lib/index.js';

export default function CompanyDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const [cycle, setCycle] = useState('monthly');

  const load = () => {
    api.get(`/superadmin/companies/${id}`)
      .then(({ data }) => setData(data.data))
      .catch((err) => setError(err.message));
    api.get('/superadmin/plans').then(({ data }) => setPlans(data.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [id]);

  const changeStatus = async (status) => {
    setBusy(true);
    setError('');
    try {
      await api.put(`/superadmin/companies/${id}/status`, { status });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const changePlan = async (plan, billingCycle) => {
    setBusy(true);
    setError('');
    try {
      await api.put(`/superadmin/companies/${id}/plan`, { plan, billingCycle, autoRenew: true });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }; 

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const startCheckout = async (plan) => {
    setBusy(true);
    setError('');
    setCheckout(null);
    try {
      const { data } = await api.post('/superadmin/checkout', { companyId: id, planId: plan, billingCycle: cycle });
      setCheckout(data.data);
      if (data.data.amount === 0) {
        load();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const openRazorpay = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      setError('Razorpay checkout SDK could not be loaded.');
      return;
    }
    const options = {
      key: checkout.keyId,
      amount: checkout.amount * 100,
      currency: checkout.currency,
      name: checkout.company.name,
      description: `${checkout.plan.name} plan (${checkout.billingCycle})`,
      order_id: checkout.orderId,
      handler: async (response) => {
        try {
          await api.post('/superadmin/payments/verify', {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            invoiceId: checkout.invoiceId,
          });
          setCheckout(null);
          load();
        } catch (err) {
          setError(err.message);
        }
      },
      theme: { color: '#5a2586' },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const impersonate = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/superadmin/impersonate', { companyId: id });
      const adminUrl = (import.meta.env.VITE_ADMIN_URL || 'http://localhost:5175').replace(/\/$/, '');
      window.open(`${adminUrl}/admin?access=${encodeURIComponent(data.token)}`, '_blank');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <div className="box muted">Loading…</div>;

  const statusClassName = (() => {
    switch (data.status) {
      case 'active':
        return 'green';
      case 'suspended':
        return 'orange';
      case 'trial':
        return 'purple';
      default:
        return 'gray';
    }
  })();

  const usagePct = data.plan
    ? Math.min(100, Math.round((data.agents / (plans.find((p) => p._id === data.plan?._id)?.maxAgents || 5)) * 100))
    : 0;

  return (
    <>
      <Link to="/superadmin/companies" className="muted" style={{ fontSize: '12px' }}>← Back to companies</Link>
      <h1>{data.name}</h1>

      <div className="box">
        <div className="box-header">
          <h1>Company Profile</h1>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" className="btn small secondary" onClick={impersonate} disabled={busy}>Impersonate Admin</button>
            {data.status !== 'suspended' && <button type="button" className="btn small danger" onClick={() => changeStatus('suspended')} disabled={busy}>Suspend</button>}
            {data.status !== 'active' && <button type="button" className="btn small" onClick={() => changeStatus('active')} disabled={busy}>Activate</button>}
          </div>
        </div>
        <dl className="kv">
          <dt>Status</dt><dd><span className={`pill ${statusClassName}`}>{data.status}</span></dd>
          <dt>Email</dt><dd>{data.email || '—'}</dd>
          <dt>Domain</dt><dd>{data.domain || '—'}</dd>
          <dt>Contact</dt><dd>{data.contactPerson || '—'} {data.phone ? `(${data.phone})` : ''}</dd>
          <dt>Plan</dt><dd>{data.plan?.name || 'No plan'} <span className="muted">({data.billingCycle})</span></dd>
          <dt>Plan Expires</dt><dd>{formatDate(data.planExpiresAt)}</dd>
          <dt>Auto Renew</dt><dd>{data.autoRenew ? 'Yes' : 'No'}</dd>
          <dt>Usage</dt>
          <dd>
            Agents {data.agents}/{data.plan?.maxAgents || '—'} · Users {data.users}/{data.plan?.maxUsers || '—'}
            <div className="progress"><span style={{ width: `${Math.max(usagePct, 4)}%` }} /></div>
          </dd>
        </dl>
      </div>

      <div className="grid-2">
        <div className="box">
          <div className="box-header"><h1>Subscription</h1></div>
          <div className="field">
            <label htmlFor="billing-cycle">Billing Cycle</label>
            <select id="billing-cycle" value={cycle} onChange={(e) => setCycle(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {plans.map((p) => {
              const price = cycle === 'yearly' ? p.priceYearly : p.priceMonthly;
              return (
                <div className="checkout-box" key={p._id} style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{p.name}</strong>
                    <div className="muted small">{price === 0 ? 'Free' : formatCurrency(price)} / {cycle === 'yearly' ? 'year' : 'month'}</div>
                  </div>
                  {data.plan?._id === p._id && data.status === 'active'
                    ? <span className="pill green">Current</span>
                    : <button type="button" className="btn small" disabled={busy} onClick={() => startCheckout(p._id)}>Upgrade</button>}
                </div>
              );
            })}
          </div>

          {checkout && checkout.amount > 0 && (
            <div className="checkout-box" style={{ padding: '14px', marginTop: '14px' }}>
              <h2>Checkout — {formatCurrency(checkout.amount)}</h2>
              <p className="muted small">Razorpay order {checkout.orderId} created.</p>
              <button type="button" className="btn" onClick={openRazorpay}>Pay with Razorpay</button>
            </div>
          )}
        </div>

        <div className="box">
          <div className="box-header"><h1>Recent Invoices</h1></div>
          {data.invoices?.length === 0 && <div className="muted">No invoices.</div>}
          {data.invoices?.map((inv) => {
            let invoiceStatusClassName = 'orange';
            if (inv.status === 'paid') {
              invoiceStatusClassName = 'green';
            } else if (inv.status === 'failed') {
              invoiceStatusClassName = 'red';
            }
            return (
              <div className="company-row" key={inv._id} style={{ padding: '8px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                <div>
                  <strong>{inv.invoiceNumber}</strong>
                  <div className="company-meta">
                    <span>{formatCurrency(inv.amount, inv.currency)}</span>
                    <span className={`pill ${invoiceStatusClassName}`}>{inv.status}</span>
                    <span>{formatDate(inv.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
