import { useEffect, useState } from 'react';
import { Bell, Send } from 'lucide-react';
import {
  useGetNotificationPrefsQuery, useUpdateNotificationPrefsMutation, useSendWhatsappMutation,
} from '@shared/store/apiEndpoints';

export default function NotificationPrefs() {
  const { data: prefs } = useGetNotificationPrefsQuery();
  const [update] = useUpdateNotificationPrefsMutation();
  const [sendWa] = useSendWhatsappMutation();
  const [channels, setChannels] = useState({ inApp: true, email: true, push: false, sms: false });
  const [quiet, setQuiet] = useState({ enabled: false, start: '22:00', end: '07:00', tz: 'UTC' });
  const [digest, setDigest] = useState('off');
  const [saved, setSaved] = useState(false);
  const [waTo, setWaTo] = useState('');
  const [waMsg, setWaMsg] = useState('');
  const [waResult, setWaResult] = useState('');

  useEffect(() => {
    if (prefs) { setChannels(prefs.channels || channels); setQuiet(prefs.quietHours || quiet); setDigest(prefs.digest || 'off'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs]);

  const save = async () => {
    await update({ channels, quietHours: quiet, digest }).unwrap();
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  const testWhatsapp = async () => {
    setWaResult('Sending…');
    try {
      const r = await sendWa({ to: waTo, message: waMsg || 'Test from platform' }).unwrap();
      setWaResult(r.delivered ? 'Delivered ✓' : 'Mock mode — configure TWILIO_WA_NUMBER to deliver');
    } catch (e: any) { setWaResult(e?.data?.error || 'Send failed'); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="h-6 w-6" /> Notification Preferences</h1>

      <div className="bg-white border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold">Channels</h3>
        {(Object.keys(channels) as Array<keyof typeof channels>).map(ch => (
          <label key={ch} className="flex items-center gap-3 text-sm capitalize">
            <input type="checkbox" checked={channels[ch]} onChange={e => setChannels({ ...channels, [ch]: e.target.checked })} className="rounded" />
            {ch}
          </label>
        ))}
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold">Quiet hours</h3>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={quiet.enabled} onChange={e => setQuiet({ ...quiet, enabled: e.target.checked })} className="rounded" />
          Enable
        </label>
        <div className="grid grid-cols-3 gap-3">
          <input type="time" value={quiet.start} onChange={e => setQuiet({ ...quiet, start: e.target.value })} className="input-field" />
          <input type="time" value={quiet.end} onChange={e => setQuiet({ ...quiet, end: e.target.value })} className="input-field" />
          <input value={quiet.tz} onChange={e => setQuiet({ ...quiet, tz: e.target.value })} placeholder="Timezone" className="input-field" />
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold">Digest</h3>
        <select value={digest} onChange={e => setDigest(e.target.value)} className="input-field max-w-xs">
          <option value="off">Off (instant)</option>
          <option value="daily">Daily summary</option>
          <option value="weekly">Weekly summary</option>
        </select>
      </div>

      <button onClick={save} className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700">
        {saved ? 'Saved ✓' : 'Save preferences'}
      </button>

      <div className="bg-white border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold flex items-center gap-2"><Send className="h-4 w-4" /> WhatsApp test send</h3>
        <div className="flex gap-2">
          <input value={waTo} onChange={e => setWaTo(e.target.value)} placeholder="+15551234567" className="input-field flex-1" />
          <input value={waMsg} onChange={e => setWaMsg(e.target.value)} placeholder="Message" className="input-field flex-1" />
          <button onClick={testWhatsapp} disabled={!waTo} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-40">Send</button>
        </div>
        {waResult && <p className="text-sm text-gray-600">{waResult}</p>}
      </div>
    </div>
  );
}
