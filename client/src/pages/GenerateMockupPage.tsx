import {
  ArrowLeft,
  Check,
  Clock3,
  Info,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { FileDropzone } from "../components/FileDropzone";
import { LoadingState } from "../components/LoadingState";
import { api } from "../services/api";
import type { Customer, HealthStatus } from "../types";

const progressMessages = [
  "Reading the property architecture…",
  "Studying the reference lighting style…",
  "Designing realistic installation lines…",
  "Rendering your presentation image…",
];

export function GenerateMockupPage() {
  const { customerId = "" } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [original, setOriginal] = useState<File | null>(null);
  const [reference, setReference] = useState<File | null>(null);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getCustomer(customerId), api.health()])
      .then(([customerData, healthData]) => {
        setCustomer(customerData);
        setHealth(healthData);
      })
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : "Unable to load this customer."),
      )
      .finally(() => setLoading(false));
  }, [customerId]);

  useEffect(() => {
    if (!generating) return;
    const interval = window.setInterval(() => {
      setProgressIndex((current) =>
        Math.min(current + 1, progressMessages.length - 1),
      );
    }, 12_000);
    return () => window.clearInterval(interval);
  }, [generating]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!original || !reference) {
      setError("Add both a house photo and style reference before generating.");
      return;
    }

    setProgressIndex(0);
    setGenerating(true);
    try {
      await api.createMockup(customerId, {
        original,
        reference,
        instructions,
      });
      navigate(`/customers/${customerId}`, {
        replace: true,
        state: { generated: true },
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Generation failed.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return <LoadingState rows={4} />;
  }

  if (!customer) {
    return (
      <EmptyState
        icon={WandSparkles}
        title="Mockup workspace unavailable"
        description={error || "This customer record could not be found."}
        action={
          <Link
            to="/customers"
            className="rounded-xl bg-pine-800 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Back to customers
          </Link>
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Link
        to={`/customers/${customer.id}`}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-pine-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {customer.name}
      </Link>

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-pine-700">
            <Sparkles className="h-3.5 w-3.5" />
            AI design workspace
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Create a lighting mockup
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Upload the property and a visual reference. We’ll preserve the home
            while applying the requested light style.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Clock3 className="h-4 w-4" />
          Most mockups take 1–2 minutes
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
          <p className="font-bold">We couldn’t generate this mockup.</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {health && !health.aiConfigured && (
        <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-800">
          <Info className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">OpenAI connection needs setup</p>
            <p className="mt-1 text-xs leading-5">
              Add the server-side OPENAI_API_KEY before generating. Your images
              and key are never sent through the browser bundle.
            </p>
          </div>
        </div>
      )}

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-6">
          <section className="surface p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pine-800 text-xs font-extrabold text-white">
                1
              </span>
              <div>
                <h2 className="font-bold text-slate-900">Add your source images</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Clear, wide photos with the full roofline produce the best sales concepts.
                </p>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <FileDropzone
                label="Customer house photo"
                hint="The exact property to preserve"
                file={original}
                onChange={setOriginal}
              />
              <FileDropzone
                label="Lighting style reference"
                hint="Colors, spacing, and mood to follow"
                file={reference}
                onChange={setReference}
              />
            </div>
          </section>

          <section className="surface p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pine-800 text-xs font-extrabold text-white">
                2
              </span>
              <div>
                <h2 className="font-bold text-slate-900">Add design instructions</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Optional—use practical installation language for better results.
                </p>
              </div>
            </div>
            <label htmlFor="instructions" className="label">
              Customer preferences or installer notes
            </label>
            <textarea
              id="instructions"
              className="field min-h-32 resize-y"
              placeholder="Example: Warm white C9 bulbs along the front roofline and garage peaks. Add matching mini lights to the two shrubs by the porch. Keep the display elegant and not too dense."
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              maxLength={1500}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Be specific about color, bulb type, and placement.</span>
              <span>{instructions.length}/1,500</span>
            </div>
          </section>

          <section className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="font-bold text-slate-900">Ready to build the concept?</h2>
              <p className="mt-1 text-sm text-slate-500">
                The result will be saved automatically to {customer.name}.
              </p>
            </div>
            <Button
              type="submit"
              loading={generating}
              disabled={!original || !reference || !health?.aiConfigured}
              icon={<WandSparkles className="h-4 w-4" />}
              className="min-w-52"
            >
              Generate mockup
            </Button>
          </section>
        </div>

        <aside className="space-y-5">
          <div className="surface overflow-hidden">
            <div className="border-b border-slate-200 bg-pine-950 px-5 py-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-pine-300">
                Creating for
              </p>
              <p className="mt-1.5 font-bold">{customer.name}</p>
              <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-pine-100/70">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {customer.address}
              </p>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Built into every AI brief
              </p>
              <ul className="mt-4 space-y-3">
                {[
                  "Preserve roof, doors, windows, and landscaping",
                  "Keep the original camera angle and property identity",
                  "Apply only the reference image’s lighting style",
                  "Use realistic bulb spacing, glow, and shadows",
                ].map((rule) => (
                  <li
                    key={rule}
                    className="flex items-start gap-2.5 text-xs leading-5 text-slate-600"
                  >
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-pine-100 text-pine-700">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-gold-300/70 bg-gold-100/60 p-5">
            <div className="flex gap-3">
              <Lightbulb className="h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <p className="text-sm font-bold text-amber-950">Photo tip</p>
                <p className="mt-1 text-xs leading-5 text-amber-900/70">
                  Use a straight-on photo with the full home visible. Avoid heavy
                  shadows, parked vehicles, and extreme wide-angle distortion.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-pine-700" />
            Source images and generated results are stored locally with this
            customer record.
          </div>
        </aside>
      </div>

      {generating && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-pine-950/80 p-5 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white text-center shadow-modal">
            <div className="relative overflow-hidden bg-gradient-to-br from-pine-800 to-pine-950 px-7 py-10 text-white">
              <div className="loading-shimmer absolute inset-0" />
              <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <WandSparkles className="h-7 w-7 text-gold-300" />
              </div>
              <h2 className="relative mt-5 text-xl font-extrabold">
                Building the lighting concept
              </h2>
              <p className="relative mt-2 text-sm text-pine-100/75">
                Keep this window open while the design renders.
              </p>
            </div>
            <div className="p-7">
              <p className="text-sm font-bold text-slate-800">
                {progressMessages[progressIndex]}
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pine-500 to-gold-300 transition-all duration-1000"
                  style={{
                    width: `${Math.max(18, ((progressIndex + 1) / progressMessages.length) * 88)}%`,
                  }}
                />
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-400">
                AI image generation can take up to two minutes for detailed
                property edits.
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
