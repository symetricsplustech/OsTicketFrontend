import { useSaveBrandingMutation, useGetOidcConfigQuery, useUpdateOidcConfigMutation, useSetMaintenanceModeMutation } from '@shared/store/apiEndpoints';
import { useEffect, useState } from 'react';
import { Save, ShieldCheck, XCircle, CheckCircle } from 'lucide-react';

export default function PlatformAdmin() {
  const { data: oidc } = useGetOidcConfigQuery();
  const [saveBranding, { isLoading: savingBranding }] = useSaveBrandingMutation();
  const [updateOidcConfig, { isLoading: savingOidc }] = useUpdateOidcConfigMutation();
  const [setMaintenanceMode, { isLoading: savingMaint }] = useSetMaintenanceModeMutation();

  const [branding, setBranding] = useState({ logoUrl: '', primaryColor: '#4f46e5', loginHeadline: '' });
  const [oidcForm, setOidcForm] = useState({ issuerUrl: '', clientId: '', clientSecret: '', redirectUri: '', enabled: false });
  const [maint, setMaint] = useState({ enabled: false, message: '' });
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    if (oidc) {
      setOidcForm({
        issuerUrl: (oidc as any).issuerUrl || '',
        clientId: (oidc as any).clientId || '',
        clientSecret: (oidc as any).clientSecret || '',
        redirectUri: (oidc as any).redirectUri || '',
        enabled: !!(oidc as any).enabled,
      });
    }
  }, [oidc]);

  const flash = (msg: string) => { setOk(msg); setTimeout(() => setOk(null), 3000); };
  const run = async (fn: () => Promise<any>, successMsg: string) => {
    setErr(null); setOk(null);
    try { await fn(); flash(successMsg); } catch (e: any) { setErr(e?.data?.message || 'Request failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><ShieldCheck className="h-6 w-6" /> Platform Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Branding, SSO and maintenance controls.</p>
      </div>

      {err && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
          <XCircle className="h-4 w-4" /> {err}
        </div>
      )}
      {ok && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" /> {ok}
        </div>
      )}

      {/* Branding */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Branding</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo URL</label>
            <input type="text" value={branding.logoUrl} onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })} className="mt-1 input-field" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Color</label>
            <input type="color" value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} className="mt-1 input-field h-10 p-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Login Headline</label>
            <input type="text" value={branding.loginHeadline} onChange={(e) => setBranding({ ...branding, loginHeadline: e.target.value })} className="mt-1 input-field" placeholder="Welcome back" />
          </div>
        </div>
        <button
          onClick={() => run(() => saveBranding(branding).unwrap(), 'Branding saved')}
          disabled={savingBranding}
          className="mt-4 btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {savingBranding ? 'Saving...' : 'Save Branding'}
        </button>
      </div>

      {/* OIDC SSO */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">OIDC SSO</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Issuer URL</label>
            <input type="text" value={oidcForm.issuerUrl} onChange={(e) => setOidcForm({ ...oidcForm, issuerUrl: e.target.value })} className="mt-1 input-field" placeholder="https://idp.example.com/.well-known/openid-configuration" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Client ID</label>
            <input type="text" value={oidcForm.clientId} onChange={(e) => setOidcForm({ ...oidcForm, clientId: e.target.value })} className="mt-1 input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Secret</label>
            <input type="password" value={oidcForm.clientSecret} onChange={(e) => setOidcForm({ ...oidcForm, clientSecret: e.target.value })} className="mt-1 input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Redirect URI</label>
            <input type="text" value={oidcForm.redirectUri} onChange={(e) => setOidcForm({ ...oidcForm, redirectUri: e.target.value })} className="mt-1 input-field" placeholder={`${window.location.origin}/auth/callback`} />
          </div>
        </div>
        <label className="mt-4 inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={oidcForm.enabled} onChange={(e) => setOidcForm({ ...oidcForm, enabled: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
          Enabled
        </label>
        <button
          onClick={() => run(() => updateOidcConfig(oidcForm).unwrap(), 'OIDC configuration saved')}
          disabled={savingOidc}
          className="ml-4 btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {savingOidc ? 'Saving...' : 'Save OIDC'}
        </button>
      </div>

      {/* Maintenance mode */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Maintenance Mode</h2>
        {maint.enabled && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 font-medium">
            ⚠ Maintenance mode is enabled — the platform is locked for all non-admin users until it is turned off.
          </div>
        )}
        <textarea
          rows={3}
          value={maint.message}
          onChange={(e) => setMaint({ ...maint, message: e.target.value })}
          className="w-full input-field"
          placeholder="Message shown to users during maintenance..."
        />
        <div className="mt-4 flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={maint.enabled}
              onChange={(e) => setMaint({ ...maint, enabled: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            Enabled
          </label>
          <button
            onClick={() => run(() => setMaintenanceMode({ enabled: maint.enabled, message: maint.message }).unwrap(), 'Maintenance mode updated')}
            disabled={savingMaint}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {savingMaint ? 'Saving...' : 'Save Maintenance Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
