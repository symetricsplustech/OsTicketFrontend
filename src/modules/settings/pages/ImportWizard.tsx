import { useValidateImportMutation, useCommitImportMutation, useRollbackImportMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { Upload, CheckCircle, XCircle, Save, Trash2, Database } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

interface ValidationError {
  row?: number;
  message?: string;
  error?: string;
}

export default function ImportWizard() {
  const [validateImport] = useValidateImportMutation();
  const [commitImport] = useCommitImportMutation();
  const [rollbackImport] = useRollbackImportMutation();

  const [entity, setEntity] = useState<'lead' | 'asset'>('lead');
  const [rowsText, setRowsText] = useState('');
  const [validation, setValidation] = useState<any>(null);
  const [batchId, setBatchId] = useState('');
  const [commitResult, setCommitResult] = useState<any>(null);
  const [rollbackMsg, setRollbackMsg] = useState('');
  const [busy, setBusy] = useState('');

  const validRows = validation?.validRows ?? validation?.valid ?? 0;
  const errorRowCount = validation?.errorRowCount ?? (Array.isArray(validation?.errors) ? validation.errors.length : 0);
  const errors: ValidationError[] = Array.isArray(validation?.errors) ? validation.errors : [];
  const committedCount = commitResult?.committed ?? commitResult?.committedCount ?? commitResult?.count ?? 0;

  const doValidate = async () => {
    setBusy('validate');
    setValidation(null);
    setCommitResult(null);
    setBatchId('');
    setRollbackMsg('');
    try {
      const rows = rowsText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split(',').map((c) => c.trim()));
      const res: any = await validateImport({ entity, rows }).unwrap();
      setValidation(res);
      setBatchId(res?.batchId || '');
    } catch (err: any) {
      setValidation({ errors: [{ message: err?.data?.error || err?.data?.message || 'Validation failed.' }] });
    } finally {
      setBusy('');
    }
  };

  const doCommit = async () => {
    if (!batchId) return;
    setBusy('commit');
    try {
      const res: any = await commitImport(batchId).unwrap();
      setCommitResult(typeof res === 'object' && res !== null ? res : { committed: res });
    } catch (err: any) {
      setCommitResult({ error: err?.data?.error || err?.data?.message || 'Commit failed.' });
    } finally {
      setBusy('');
    }
  };

  const doRollback = async () => {
    if (!batchId) return;
    setBusy('rollback');
    try {
      await rollbackImport(batchId).unwrap();
      setRollbackMsg('Import rolled back.');
      setCommitResult(null);
      setValidation(null);
      setBatchId('');
    } catch (err: any) {
      setRollbackMsg(err?.data?.error || err?.data?.message || 'Rollback failed.');
    } finally {
      setBusy('');
    }
  };

  const step = !validation ? 1 : commitResult ? 3 : 2;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Import Wizard</h1>
      </div>

      <div className="flex items-center gap-4">
        {['Validate', 'Commit', 'Rollback'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${step > i ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {i + 1}
            </span>
            <span className={`text-sm font-medium ${step > i ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
            {i < 2 && <span className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-w-2xl">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Step 1 — Validate</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select value={entity} onChange={(e) => setEntity(e.target.value as 'lead' | 'asset')} className={inputCls}>
            <option value="lead">lead</option>
            <option value="asset">asset</option>
          </select>
          <p className="self-center text-xs text-gray-400">One record per line. Format: "name,email" or "name".</p>
        </div>
        <textarea
          value={rowsText}
          onChange={(e) => setRowsText(e.target.value)}
          rows={6}
          placeholder={'Acme Corp,acme@example.com\nGlobex'}
          className={`${inputCls} font-mono`}
        />
        <button
          onClick={doValidate}
          disabled={busy === 'validate' || !rowsText.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" /> Validate
        </button>

        {validation && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-green-700"><CheckCircle className="h-4 w-4" /> Valid rows: {validRows}</span>
              <span className="inline-flex items-center gap-1.5 text-red-600"><XCircle className="h-4 w-4" /> Error rows: {errorRowCount}</span>
            </div>
            {errors.length > 0 && (
              <ul className="rounded-lg bg-red-50 border border-red-100 divide-y divide-red-100 text-xs text-red-700">
                {errors.map((e, i) => (
                  <li key={i} className="px-3 py-1.5">{e.row != null ? `Row ${e.row}: ` : ''}{e.message || e.error || 'Invalid row'}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {validRows > 0 && batchId && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 max-w-2xl">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Step 2 — Commit</h2>
          <p className="text-sm text-gray-500">Batch <span className="font-mono text-gray-800">{batchId}</span> with {validRows} valid rows is ready to commit.</p>
          <button
            onClick={doCommit}
            disabled={busy === 'commit'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Commit Import
          </button>
          {commitResult?.error && <p className="text-xs text-red-600">{commitResult.error}</p>}
        </div>
      )}

      {commitResult && !commitResult.error && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 max-w-2xl">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Step 3 — Rollback</h2>
          <p className="text-sm text-green-700 inline-flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" /> Committed {committedCount} rows into {entity}.
          </p>
          <button
            onClick={doRollback}
            disabled={busy === 'rollback'}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> Rollback Import
          </button>
          {rollbackMsg && <p className="text-xs text-gray-600">{rollbackMsg}</p>}
        </div>
      )}
    </div>
  );
}
