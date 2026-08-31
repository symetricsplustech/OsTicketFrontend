import api from '@shared/lib/api';
import React, { useEffect, useState } from 'react';
import { Settings, ShieldCheck, Mail, CheckCircle, XCircle, Download, Wrench } from 'lucide-react';

interface SsoForm {
  protocol: string;
  idpEntityId: string;
  idpSsoUrl: string;
  idpCertificate: string;
  spEntityId: string;
  acsUrl: string;
  enabled: boolean;
}

interface LdapForm {
  url: string;
  bindDn: string;
  bindPassword: string;
  searchBase: string;
  searchFilter: string;
  enabled: boolean;
}

const emptySso: SsoForm = {
  protocol: 'saml2',
  idpEntityId: '',
  idpSsoUrl: '',
  idpCertificate: '',
  spEntityId: '',
  acsUrl: '',
  enabled: false,
};

const emptyLdap: LdapForm = {
  url: '',
  bindDn: '',
  bindPassword: '',
  searchBase: '',
  searchFilter: '(uid=%u)',
  enabled: false,
};

const inputCls =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

export default function IntegrationsConfig() {
  const [sso, setSso] = useState<SsoForm>(emptySso);
  const [ssoMeta, setSsoMeta] = useState<{ spEntityId?: string; acsUrl?: string } | null>(null);
  const [ssoMsg, setSsoMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [ldap, setLdap] = useState<LdapForm>(emptyLdap);
  const [ldapMsg, setLdapMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [ldapTestResult, setLdapTestResult] = useState<string | null>(null);

  const [smsTo, setSmsTo] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsResult, setSmsResult] = useState<string | null>(null);
  const [smsSending, setSmsSending] = useState(false);

  const [malwareContent, setMalwareContent] = useState('');
  const [malwareResult, setMalwareResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const [jobMsg, setJobMsg] = useState<string | null>(null);
  const [jobEngine, setJobEngine] = useState<string | null>(null);
  const [jobBusy, setJobBusy] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const res = await api.get('/ops/integrations/sso');
        setSso({ ...emptySso, ...(res.data.sso || res.data) });
      } catch {}
      try {
        const metaRes = await api.get('/ops/integrations/sso/metadata');
        setSsoMeta(metaRes.data.spEntityId ? metaRes.data : metaRes.data.sp || metaRes.data);
      } catch {
        setSsoMeta(null);
      }
      try {
        const ldapRes = await api.get('/ops/integrations/ldap');
        setLdap({ ...emptyLdap, ...(ldapRes.data.ldap || ldapRes.data) });
      } catch {}
    };
    loadAll();
  }, []);

  const saveSso = async () => {
    setSsoMsg(null);
    try {
      await api.put('/ops/integrations/sso', sso);
      setSsoMsg({ ok: true, text: 'SSO configuration saved.' });
    } catch {
      setSsoMsg({ ok: false, text: 'Failed to save SSO configuration.' });
    }
  };

  const saveLdap = async () => {
    setLdapMsg(null);
    try {
      await api.put('/ops/integrations/ldap', ldap);
      setLdapMsg({ ok: true, text: 'LDAP configuration saved.' });
    } catch {
      setLdapMsg({ ok: false, text: 'Failed to save LDAP configuration.' });
    }
  };

  const testLdap = async () => {
    setLdapTestResult(null);
    setLdapMsg(null);
    try {
      const res = await api.post('/ops/integrations/ldap/test', {});
      setLdapTestResult(JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      setLdapTestResult(JSON.stringify(err.response?.data || { error: 'Test failed' }, null, 2));
    }
  };

  const sendSms = async () => {
    setSmsSending(true);
    setSmsResult(null);
    try {
      const res = await api.post('/ops/integrations/sms/test', { to: smsTo, message: smsMessage });
      setSmsResult(JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      setSmsResult(JSON.stringify(err.response?.data || { error: 'Send failed' }, null, 2));
    } finally {
      setSmsSending(false);
    }
  };

  const scanContent = async () => {
    if (!malwareContent) return;
    setScanning(true);
    setMalwareResult(null);
    try {
      const res = await api.post('/ops/integrations/malware/scan', { contentBase64: btoa(malwareContent) });
      setMalwareResult(
        JSON.stringify(res.data.clean ? 'Clean: no threats detected.' : 'Threats found!', null, 0)
      );
    } catch (err: any) {
      const data = err.response?.data;
      setMalwareResult(
        typeof data === 'string'
          ? data
          : JSON.stringify(data || { error: 'Scan failed' })
      );
    } finally {
      setScanning(false);
    }
  };

  const enqueueJob = async () => {
    setJobBusy(true);
    setJobMsg(null);
    try {
      const res = await api.post('/ops/jobs/enqueue', { name: 'test' });
      const engine = res.data.engine || res.data.queue || 'inline';
      setJobEngine(String(engine));
      setJobMsg('Test job enqueued.');
    } catch {
      setJobMsg('Failed to enqueue test job.');
    } finally {
      setJobBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <ShieldCheck className="h-5 w-5 text-brand-600" />
            SSO / SAML
          </h2>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={sso.enabled}
              onChange={(e) => setSso({ ...sso, enabled: e.target.checked })}
              className="rounded border-gray-300"
            />
            Enabled
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={sso.protocol}
            onChange={(e) => setSso({ ...sso, protocol: e.target.value })}
            className={inputCls}
          >
            <option value="saml2">SAML 2.0</option>
            <option value="oidc">OpenID Connect</option>
          </select>
          <input
            type="text"
            placeholder="IdP Entity ID"
            value={sso.idpEntityId}
            onChange={(e) => setSso({ ...sso, idpEntityId: e.target.value })}
            className={inputCls}
          />
          <input
            type="url"
            placeholder="IdP SSO URL"
            value={sso.idpSsoUrl}
            onChange={(e) => setSso({ ...sso, idpSsoUrl: e.target.value })}
            className={inputCls}
          />
          <input
            type="text"
            placeholder="SP Entity ID"
            value={sso.spEntityId}
            onChange={(e) => setSso({ ...sso, spEntityId: e.target.value })}
            className={inputCls}
          />
          <input
            type="url"
            placeholder="ACS URL"
            value={sso.acsUrl}
            onChange={(e) => setSso({ ...sso, acsUrl: e.target.value })}
            className={inputCls}
          />
        </div>
        <textarea
          placeholder="IdP Certificate (PEM)"
          rows={4}
          value={sso.idpCertificate}
          onChange={(e) => setSso({ ...sso, idpCertificate: e.target.value })}
          className={`${inputCls} font-mono`}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={saveSso}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium"
          >
            Save SSO
          </button>
          {ssoMsg && ssoMsg.ok && (
            <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {ssoMsg.text}</span>
          )}
          {ssoMsg && !ssoMsg.ok && (
            <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {ssoMsg.text}</span>
          )}
        </div>
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">SP Metadata</h3>
          </div>
          {ssoMeta ? (
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
              {`spEntityId: ${ssoMeta.spEntityId || sso.spEntityId}\nacsUrl: ${ssoMeta.acsUrl || sso.acsUrl}`}
            </pre>
          ) : (
            <p className="text-sm text-gray-500">Metadata unavailable.</p>
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Settings className="h-5 w-5 text-brand-600" />
            LDAP
          </h2>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={ldap.enabled}
              onChange={(e) => setLdap({ ...ldap, enabled: e.target.checked })}
              className="rounded border-gray-300"
            />
            Enabled
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="url"
            placeholder="LDAP URL"
            value={ldap.url}
            onChange={(e) => setLdap({ ...ldap, url: e.target.value })}
            className={inputCls}
          />
          <input
            type="text"
            placeholder="Bind DN"
            value={ldap.bindDn}
            onChange={(e) => setLdap({ ...ldap, bindDn: e.target.value })}
            className={inputCls}
          />
          <input
            type="password"
            placeholder="Bind Password"
            value={ldap.bindPassword}
            onChange={(e) => setLdap({ ...ldap, bindPassword: e.target.value })}
            className={inputCls}
          />
          <input
            type="text"
            placeholder="Search Base"
            value={ldap.searchBase}
            onChange={(e) => setLdap({ ...ldap, searchBase: e.target.value })}
            className={inputCls}
          />
          <input
            type="text"
            placeholder="Search Filter"
            value={ldap.searchFilter}
            onChange={(e) => setLdap({ ...ldap, searchFilter: e.target.value })}
            className={inputCls}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveLdap}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium"
          >
            Save LDAP
          </button>
          <button
            onClick={testLdap}
            className="px-4 py-2 border border-brand-300 text-brand-700 rounded-lg hover:bg-brand-50 text-sm font-medium"
          >
            Test Connection
          </button>
          {ldapMsg && ldapMsg.ok && (
            <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {ldapMsg.text}</span>
          )}
          {ldapMsg && !ldapMsg.ok && (
            <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {ldapMsg.text}</span>
          )}
        </div>
        {ldapTestResult && (
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">{ldapTestResult}</pre>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Mail className="h-5 w-5 text-brand-600" />
          SMS (Twilio)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="tel"
            placeholder="+15551234567"
            value={smsTo}
            onChange={(e) => setSmsTo(e.target.value)}
            className={inputCls}
          />
          <input
            type="text"
            placeholder="Message"
            value={smsMessage}
            onChange={(e) => setSmsMessage(e.target.value)}
            className={`${inputCls} md:col-span-2`}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={sendSms}
            disabled={smsSending || !smsTo.trim()}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50"
          >
            {smsSending ? 'Sending...' : 'Send Test SMS'}
          </button>
        </div>
        {smsResult && (
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">{smsResult}</pre>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <ShieldCheck className="h-5 w-5 text-brand-600" />
          Malware Scanning
        </h2>
        <textarea
          placeholder="Paste content to scan"
          rows={3}
          value={malwareContent}
          onChange={(e) => setMalwareContent(e.target.value)}
          className={inputCls}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={scanContent}
            disabled={scanning || !malwareContent}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50"
          >
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
          {malwareResult && malwareResult.startsWith('Clean') && (
            <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {malwareResult}</span>
          )}
          {malwareResult && !malwareResult.startsWith('Clean') && (
            <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {malwareResult}</span>
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Wrench className="h-5 w-5 text-brand-600" />
          Job Queue
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={enqueueJob}
            disabled={jobBusy}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50"
          >
            {jobBusy ? 'Enqueueing...' : 'Enqueue test job'}
          </button>
          {jobEngine && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">engine: {jobEngine}</span>
          )}
          {jobMsg && jobMsg.startsWith('Test') && (
            <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {jobMsg}</span>
          )}
          {jobMsg && !jobMsg.startsWith('Test') && (
            <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {jobMsg}</span>
          )}
        </div>
      </section>
    </div>
  );
}
