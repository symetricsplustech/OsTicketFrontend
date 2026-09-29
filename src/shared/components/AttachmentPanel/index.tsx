import { useState } from "react";
import {
  Paperclip, Image, FileText, Download, Trash2,
  Upload, Eye, File, X, Loader2, AlertCircle,
} from "lucide-react";
import { Input } from "@shared/components/ui";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { cn } from "@shared/lib/cn";

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "pdf" | "document" | "archive" | "default";
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
  previewUrl?: string;
}

interface AttachmentPanelProps {
  attachments: Attachment[];
  onUpload?: (files: FileList) => void;
  onRemove?: (id: string) => void;
  onDownload?: (id: string) => void;
  onPreview?: (id: string) => void;
  loading?: boolean;
  maxSize?: string;
  allowedTypes?: string[];
  disabled?: boolean;
}

const typeIcons = {
  image: Image,
  pdf: FileText,
  document: FileText,
  archive: File,
  default: Paperclip,
};

const typeColors = {
  image: "bg-blue-100 text-blue-700",
  pdf: "bg-red-100 text-red-700",
  document: "bg-amber-100 text-amber-700",
  archive: "bg-slate-100 text-slate-700",
  default: "bg-slate-100 text-slate-600",
};

export function AttachmentPanel({
  attachments, onUpload, onRemove, onDownload, onPreview,
  loading, maxSize, allowedTypes, disabled,
}: AttachmentPanelProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (maxSize) {
      const maxBytes = parseInt(maxSize) * 1024 * 1024;
      for (const file of files) {
        if (file.size > maxBytes) {
          setError(`File ${file.name} exceeds maximum size of ${maxSize}MB`);
          setTimeout(() => setError(null), 5000);
          return;
        }
      }
    }

    if (allowedTypes && allowedTypes.length > 0) {
      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        if (!allowedTypes.some((t) => file.type.includes(t) || ext === t)) {
          setError(`File type not allowed. Allowed: ${allowedTypes.join(", ")}`);
          setTimeout(() => setError(null), 5000);
          return;
        }
      }
    }

    setIsUploading(true);
    setError(null);
    onUpload?.(files);
    setTimeout(() => setIsUploading(false), 1000);
  };

  if (loading) {
    return <Card><CardBody className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></CardBody></Card>;
  }

  return (
    <Card>
      <CardHeader
        title="Attachments"
        description={`${attachments.length} file(s) attached`}
        actions={
          onUpload ? (
            <label className="cursor-pointer">
              <input type="file" multiple className="hidden" onChange={handleFileChange} disabled={disabled || isUploading} />
              <Button variant="outline" size="sm" as="span" disabled={disabled || isUploading}>
                <Upload className="h-3.5 w-3.5" /> {isUploading ? "Uploading…" : "Upload"}
              </Button>
            </label>
          ) : null
        }
      />
      <CardBody>
        {error ? (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        ) : null}
        {attachments.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">No attachments yet</div>
        ) : (
          <div className="space-y-2">
            {attachments.map((att) => {
              const Icon = typeIcons[att.type] ?? Paperclip;
              return (
                <div key={att.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-md", typeColors[att.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{att.name}</p>
                    <p className="text-[10px] text-slate-500">{att.size} · {att.uploadedAt} · {att.uploadedBy}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {onPreview ? <Button variant="ghost" size="sm" onClick={() => onPreview(att.id)}><Eye className="h-3 w-3" /></Button> : null}
                    {onDownload ? <Button variant="ghost" size="sm" onClick={() => onDownload(att.id)}><Download className="h-3 w-3" /></Button> : null}
                    {onRemove ? <Button variant="ghost" size="sm" onClick={() => onRemove(att.id)} className="text-red-500"><Trash2 className="h-3 w-3" /></Button> : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
