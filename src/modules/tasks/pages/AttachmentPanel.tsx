import React, { useState, useEffect, useRef } from "react";
import { Upload, File, Trash2, Download } from "lucide-react";
import { taskApi } from "@modules/tasks/services/taskApi";

interface Attachment {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy?: { name: string; email: string };
  createdAt: string;
  description?: string;
}

interface Props {
  taskId: string;
  isTerminal?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentPanel({ taskId, isTerminal }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAttachments = async () => {
    try {
      const res = await taskApi.listAttachments(taskId);
      setAttachments(res.data);
    } catch {
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [taskId]);

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await taskApi.uploadAttachment(taskId, file, isPublic, description);
      setDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadAttachments();
    } catch {
      // error
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this attachment?")) return;
    await taskApi.removeAttachment(id);
    loadAttachments();
  };

  const handleDownload = async (id: string, name: string) => {
    const res = await taskApi.downloadAttachment(id);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">
        Attachments ({attachments.length})
      </h2>

      {!isTerminal && (
        <div className="mb-4 space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={() => {}}
          />
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              <Upload className="h-4 w-4" /> Select File
            </button>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
            <label className="flex items-center gap-1 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />{" "}
              Public
            </label>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : attachments.length === 0 ? (
        <div className="text-sm text-gray-400">No attachments</div>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div
              key={att._id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {att.originalName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(att.size)} |{" "}
                    {att.uploadedBy?.name || "Unknown"} |{" "}
                    {new Date(att.createdAt).toLocaleDateString()}
                  </div>
                  {att.description && (
                    <div className="text-xs text-gray-500 italic">
                      {att.description}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDownload(att._id, att.originalName)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Download"
                >
                  <Download className="h-4 w-4 text-gray-500" />
                </button>
                {!isTerminal && (
                  <button
                    onClick={() => handleDelete(att._id)}
                    className="p-1 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
