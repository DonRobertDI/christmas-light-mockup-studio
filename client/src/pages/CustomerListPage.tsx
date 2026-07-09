import {
  ArrowRight,
  CalendarPlus,
  Images,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { CreateCustomerModal } from "../components/CreateCustomerModal";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { formatDate, initials } from "../lib/format";
import { api } from "../services/api";
import type { CustomerSummary } from "../types";

export function CustomerListPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [loadedAt] = useState(Date.now);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const createOpen = searchParams.get("new") === "1";

  useEffect(() => {
    let active = true;
    api
      .listCustomers()
      .then((data) => active && setCustomers(data))
      .catch((caught) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Unable to load customers.");
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(value) ||
        customer.address.toLowerCase().includes(value),
    );
  }, [customers, query]);

  const totalMockups = customers.reduce(
    (total, customer) => total + customer.mockupCount,
    0,
  );
  const recentCustomers = customers.filter(
    (customer) =>
      loadedAt - new Date(customer.createdAt).getTime() <
      30 * 24 * 60 * 60 * 1000,
  ).length;

  function closeCreate() {
    setSearchParams({}, { replace: true });
  }

  return (
    <>
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-pine-700">
            <Sparkles className="h-3.5 w-3.5" />
            Sales workspace
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Christmas Light Mockup Studio
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Organize prospects and turn real property photos into presentation-ready
            lighting concepts.
          </p>
        </div>
        <Button
          onClick={() => setSearchParams({ new: "1" })}
          icon={<Plus className="h-4 w-4" />}
          className="sm:min-w-40"
        >
          Add customer
        </Button>
      </section>

      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Active customers",
            value: customers.length,
            helper: "Total prospect records",
            icon: Users,
            color: "bg-pine-50 text-pine-700",
          },
          {
            label: "Saved mockups",
            value: totalMockups,
            helper: "Ready for sales follow-up",
            icon: Images,
            color: "bg-amber-50 text-amber-700",
          },
          {
            label: "Added this month",
            value: recentCustomers,
            helper: "New opportunities",
            icon: CalendarPlus,
            color: "bg-rose-50 text-rose-700",
          },
        ].map((stat) => (
          <div key={stat.label} className="surface flex items-center gap-4 p-5">
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold tracking-tight text-slate-900">
                {loading ? "—" : stat.value}
              </p>
              <p className="text-sm font-semibold text-slate-700">{stat.label}</p>
              <p className="mt-0.5 text-xs text-slate-400">{stat.helper}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-7">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer records</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Every concept stays organized with its property.
            </p>
          </div>
          {customers.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                className="field py-2.5 pl-9"
                placeholder="Search name or address"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search customers"
              />
            </div>
          )}
        </div>

        {loading ? (
          <LoadingState rows={4} />
        ) : error ? (
          <div className="surface border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <p className="font-semibold">Customer records could not be loaded.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Your first customer starts here"
            description="Add a name and property address. The record is saved immediately and every mockup you generate will stay attached to it."
            action={
              <Button
                onClick={() => setSearchParams({ new: "1" })}
                icon={<Plus className="h-4 w-4" />}
              >
                Add first customer
              </Button>
            }
          />
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching customers"
            description={`No records match “${query}.” Try a different name or address.`}
            action={
              <Button variant="secondary" onClick={() => setQuery("")}>
                Clear search
              </Button>
            }
          />
        ) : (
          <div className="surface overflow-hidden">
            <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_120px_110px_40px] gap-5 border-b border-slate-200 bg-slate-50/80 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500 md:grid">
              <span>Customer</span>
              <span>Property</span>
              <span>Mockups</span>
              <span>Added</span>
              <span />
            </div>
            <div className="divide-y divide-slate-200">
              {filteredCustomers.map((customer) => (
                <Link
                  key={customer.id}
                  to={`/customers/${customer.id}`}
                  className="group grid gap-4 px-4 py-4 transition hover:bg-pine-50/45 sm:px-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_120px_110px_40px] md:items-center md:gap-5"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    {customer.latestMockupPath ? (
                      <img
                        src={customer.latestMockupPath}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-pine-100 text-sm font-bold text-pine-800">
                        {initials(customer.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900 transition group-hover:text-pine-800">
                        {customer.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        ID {customer.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <p className="flex items-start gap-2 text-sm leading-5 text-slate-500">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span className="line-clamp-2">{customer.address}</span>
                  </p>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        customer.mockupCount
                          ? "bg-pine-100 text-pine-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {customer.mockupCount}{" "}
                      {customer.mockupCount === 1 ? "mockup" : "mockups"}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {formatDate(customer.createdAt, { year: undefined })}
                  </span>
                  <ArrowRight className="hidden h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-pine-700 md:block" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <CreateCustomerModal
        open={createOpen}
        onClose={closeCreate}
        onCreated={(customer) => {
          closeCreate();
          navigate(`/customers/${customer.id}`);
        }}
      />
    </>
  );
}
