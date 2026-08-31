import { useState } from 'react';
import { FileText, Copy, CheckCircle } from 'lucide-react';

const TEMPLATES: Record<string, string> = {
  employment_letter: `Date: {{date}}

To Whom It May Concern,

This is to certify that {{name}} is employed with our organization. This letter is issued upon the request of the employee for their records.

Sincerely,
Human Resources`,
  salary_certificate: `Date: {{date}}

SALARY CERTIFICATE

This certifies that {{name}} is currently employed and receives a monthly salary as per organizational records.

Sincerely,
Payroll Department`,
  experience_letter: `Date: {{date}}

EXPERIENCE LETTER

{{name}} has been associated with our organization and has gained valuable experience during their tenure. This letter confirms their professional experience with us.

Sincerely,
Human Resources`,
  noc: `Date: {{date}}

NO OBJECTION CERTIFICATE

We have no objection to {{name}} pursuing opportunities outside working hours. This certificate is issued at the employee's request.

Sincerely,
Human Resources`,
};

export default function DocTemplates() {
  const [templateName, setTemplateName] = useState('employment_letter');
  const [employeeName, setEmployeeName] = useState('');
  const [body, setBody] = useState(TEMPLATES['employment_letter']);
  const [copied, setCopied] = useState(false);

  const date = new Date().toLocaleDateString();
  const preview = body.replace(/\{\{name\}\}/g, employeeName.trim() || '<Employee Name>').replace(/\{\{date\}\}/g, date);

  const handleTemplateChange = (t: string) => {
    setTemplateName(t);
    setBody(TEMPLATES[t] || '');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText className="h-6 w-6" /> HR Document Templates</h1>
        <p className="text-sm text-gray-500 mt-1">Compose letters locally — tokens are substituted live in the preview.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Editor */}
        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Template</label>
            <select value={templateName} onChange={(e) => handleTemplateChange(e.target.value)} className="mt-1 input-field">
              <option value="employment_letter">employment_letter</option>
              <option value="salary_certificate">salary_certificate</option>
              <option value="experience_letter">experience_letter</option>
              <option value="noc">noc</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee Name</label>
            <input type="text" placeholder="{{name}}" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="mt-1 input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date (auto)</label>
            <input type="text" value={date} readOnly className="mt-1 input-field bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body — use <code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code> and <code className="bg-gray-100 px-1 rounded">{'{{date}}'}</code> tokens
            </label>
            <textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} className="w-full input-field font-mono text-sm" />
          </div>
        </div>

        {/* Preview */}
        <div className="card p-6 space-y-3 lg:sticky lg:top-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Preview</h2>
            <button onClick={handleCopy} className="btn-secondary inline-flex items-center gap-2">
              {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="whitespace-pre-wrap bg-white border border-gray-100 rounded-lg p-5 text-sm leading-relaxed font-serif min-h-[24rem]">{preview}</pre>
        </div>
      </div>
    </div>
  );
}
