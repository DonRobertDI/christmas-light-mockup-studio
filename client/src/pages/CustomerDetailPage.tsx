import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Images,
  MapPin,
  Plus,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { MockupPreviewModal } from "../components/MockupPreviewModal";
import { formatDate, initials } from "../lib/format";
import { api, publicUrl } from "../services/api";
import type { Customer, Mockup } from "../types";

export function CustomerDetailPage() {
  const { customerId = "" } = useParams();
  const location = useLocation();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedMockup, setSelectedMockup] = useState<Mockup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(
    Boolean((location.state as { generated?: boolean } | null)?.generated),
  );

  useEffect(() => {
    let active = true;
    api
      .getCustomer(customerId)
      .then((data) => active && setCustomer(data))
      .catch((caught) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Unable to load customer.");
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [customerId]);

  if (loading) {
    return (
      <div>
        <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <LoadingState rows={3} />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <EmptyState
        icon={Images}
        title="Customer record unavailable"
        description={error || "This customer could not be found."}
        action={
          <Link
            to="/customers"
            className="inline-flex items-center gap-2 rounded-xl bg-pine-800 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to customers
          </Link>
        }
      />
    );
  }

  return (
    <>
      <Link
        to="/customers"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-pine-800"
      >
        <ArrowLeft className="h-4 w-4" />
        All customers
      </Link>

      {showSuccess && (
        <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-emerald-800">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-bold">Mockup generated and saved</p>
              <p className="mt-0.5 text-xs text-emerald-700">
                It is now part of this customer’s permanent gallery.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="text-xs font-bold uppercase tracking-wide text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="surface relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-pine-50" />
        <div className="relative flex flex-col justify-between gap-6 p-5 sm:p-7 md:flex-row md:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-pine-100 text-lg font-extrabold text-pine-800">
              {initials(customer.name)}
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-pine-700">
                Customer record
              </p>
              <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-950">
                {customer.name}
              </h1>
              <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {customer.address}
              </p>
            </div>
          </div>
          <Link
            to={`/customers/${customer.id}/generate`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-pine-800 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-pine-900"
          >
            <Sparkles className="h-4 w-4" />
            Generate mockup
          </Link>
        </div>
        <div className="relative flex flex-wrap gap-x-7 gap-y-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3.5 text-xs text-slate-500 sm:px-7">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Added {formatDate(customer.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Images className="h-3.5 w-3.5" />
            {customer.mockups.length} saved{" "}
            {customer.mockups.length === 1 ? "mockup" : "mockups"}
          </span>
          <span className="text-slate-400">
            Record {customer.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Mockup gallery</h2>
            <p className="mt-1 text-sm text-slate-500">
              Generated concepts are automatically saved here.
            </p>
          </div>
          {customer.mockups.length > 0 && (
            <Link
              to={`/customers/${customer.id}/generate`}
              className="hidden items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
            >
              <Plus className="h-4 w-4" />
              New concept
            </Link>
          )}
        </div>

        {customer.mockups.length === 0 ? (
          <EmptyState
            icon={Images}
            title="No mockups yet"
            description="Upload a clear house photo and a lighting reference to create this customer’s first proposal-ready concept."
            action={
              <Link
                to={`/customers/${customer.id}/generate`}
                className="inline-flex items-center gap-2 rounded-xl bg-pine-800 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Sparkles className="h-4 w-4" />
                Create first mockup
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {customer.mockups.map((mockup, index) => (
              <button
                key={mockup.id}
                onClick={() => setSelectedMockup(mockup)}
                className="surface group overflow-hidden text-left transition hover:-translate-y-0.5 hover:border-pine-200 hover:shadow-lg"
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-slate-200">
                  <img
                    src={publicUrl(mockup.generatedMockupImagePath)}
                    alt={`Christmas light concept ${index + 1}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur">
                    AI concept
                  </span>
                  <div className="absolute inset-0 grid place-items-center bg-pine-950/0 transition group-hover:bg-pine-950/20">
                    <span className="translate-y-2 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-800 opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100">
                      View details
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-bold text-slate-900">
                      Lighting concept {customer.mockups.length - index}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(mockup.createdAt, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex -space-x-2">
                    <img
                      src={publicUrl(mockup.originalImagePath)}
                      alt=""
                      className="h-8 w-8 rounded-full border-2 border-white object-cover"
                    />
                    <img
                      src={publicUrl(mockup.referenceImagePath)}
                      alt=""
                      className="h-8 w-8 rounded-full border-2 border-white object-cover"
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <MockupPreviewModal
        mockup={selectedMockup}
        customer={customer}
        onClose={() => setSelectedMockup(null)}
      />
    </>
  );
}
