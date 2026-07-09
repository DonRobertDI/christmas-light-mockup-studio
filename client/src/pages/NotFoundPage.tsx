import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";

export function NotFoundPage() {
  return (
    <EmptyState
      icon={Home}
      title="That page isn’t in the studio"
      description="The link may be outdated, or the customer record may have moved."
      action={
        <Link
          to="/customers"
          className="rounded-xl bg-pine-800 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Return to customers
        </Link>
      }
    />
  );
}
