import { CalendarDays, ExternalLink, Image, MapPin, Sparkles } from "lucide-react";
import { formatDate } from "../lib/format";
import { publicUrl } from "../services/api";
import type { Customer, Mockup } from "../types";
import { Modal } from "./Modal";

interface MockupPreviewModalProps {
  mockup: Mockup | null;
  customer: Customer;
  onClose: () => void;
}

export function MockupPreviewModal({
  mockup,
  customer,
  onClose,
}: MockupPreviewModalProps) {
  return (
    <Modal
      open={Boolean(mockup)}
      onClose={onClose}
      title="Mockup preview"
      description={mockup ? `Generated ${formatDate(mockup.createdAt)}` : undefined}
      size="xl"
    >
      {mockup && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_310px]">
          <div className="bg-slate-950 p-3 sm:p-5">
            <img
              src={publicUrl(mockup.generatedMockupImagePath)}
              alt={`Christmas light mockup for ${customer.name}`}
              className="mx-auto max-h-[68vh] w-full rounded-xl object-contain"
            />
          </div>
          <aside className="space-y-6 p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-pine-700">
                Customer
              </p>
              <p className="mt-2 font-bold text-slate-900">{customer.name}</p>
              <p className="mt-1 flex items-start gap-2 text-sm leading-5 text-slate-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {customer.address}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={publicUrl(mockup.originalImagePath)}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-xl border border-slate-200"
              >
                <img
                  src={publicUrl(mockup.originalImagePath)}
                  alt="Original house"
                  className="h-24 w-full object-cover transition group-hover:scale-105"
                />
                <span className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-600">
                  <Image className="h-3.5 w-3.5" /> Original
                </span>
              </a>
              <a
                href={publicUrl(mockup.referenceImagePath)}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-xl border border-slate-200"
              >
                <img
                  src={publicUrl(mockup.referenceImagePath)}
                  alt="Style reference"
                  className="h-24 w-full object-cover transition group-hover:scale-105"
                />
                <span className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-600">
                  <Sparkles className="h-3.5 w-3.5" /> Reference
                </span>
              </a>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />
                Saved record
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                The source photos, generated image, exact AI brief, and timestamp
                are stored with this customer.
              </p>
            </div>

            <a
              href={publicUrl(mockup.generatedMockupImagePath)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pine-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-pine-900"
            >
              Open full resolution
              <ExternalLink className="h-4 w-4" />
            </a>
          </aside>
        </div>
      )}
    </Modal>
  );
}
