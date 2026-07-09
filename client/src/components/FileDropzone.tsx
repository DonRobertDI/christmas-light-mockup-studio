import { CheckCircle2, ImagePlus, RefreshCw, UploadCloud } from "lucide-react";
import { useEffect, useId, useState } from "react";

interface FileDropzoneProps {
  label: string;
  hint: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

export function FileDropzone({
  label,
  hint,
  file,
  onChange,
}: FileDropzoneProps) {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) return;
    let active = true;
    const reader = new FileReader();
    reader.onload = () => {
      if (active && typeof reader.result === "string") {
        setPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
    return () => {
      active = false;
    };
  }, [file]);

  function acceptFile(candidate?: File) {
    if (!candidate) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(candidate.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (candidate.size > 15 * 1024 * 1024) {
      setError("Image must be smaller than 15 MB.");
      return;
    }
    setError("");
    onChange(candidate);
  }

  return (
    <div>
      <div className="mb-2.5 flex items-end justify-between gap-3">
        <div>
          <label htmlFor={inputId} className="text-sm font-bold text-slate-800">
            {label}
          </label>
          <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
        </div>
        {file && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-pine-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Ready
          </span>
        )}
      </div>

      <label
        htmlFor={inputId}
        className={`group relative block h-64 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition ${
          dragging
            ? "border-pine-500 bg-pine-50"
            : file
              ? "border-pine-300 bg-slate-950"
              : "border-slate-300 bg-slate-50 hover:border-pine-400 hover:bg-pine-50/50"
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          acceptFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          id={inputId}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => acceptFile(event.target.files?.[0])}
        />

        {file && preview ? (
          <>
            <img
              src={preview}
              alt={`${label} preview`}
              className="h-full w-full object-cover opacity-90 transition group-hover:opacity-75"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/95 to-transparent px-4 pb-4 pt-12 text-white">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{file?.name}</p>
                <p className="mt-0.5 text-xs text-white/65">
                  {file && (file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <span className="ml-3 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-semibold backdrop-blur">
                <RefreshCw className="h-3.5 w-3.5" />
                Replace
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-pine-700 shadow-sm ring-1 ring-slate-200">
              {dragging ? (
                <ImagePlus className="h-5 w-5" />
              ) : (
                <UploadCloud className="h-5 w-5" />
              )}
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Drop an image here or{" "}
              <span className="text-pine-700">browse files</span>
            </p>
            <p className="mt-1.5 text-xs text-slate-400">
              JPG, PNG or WebP · 15 MB max
            </p>
          </div>
        )}
      </label>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
