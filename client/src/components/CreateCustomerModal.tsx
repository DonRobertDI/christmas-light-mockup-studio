import { MapPin, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { api } from "../services/api";
import type { Customer } from "../types";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (customer: Customer) => void;
}

export function CreateCustomerModal({
  open,
  onClose,
  onCreated,
}: CreateCustomerModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleClose() {
    setName("");
    setAddress("");
    setError("");
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2 || address.trim().length < 5) {
      setError("Enter the customer's name and complete property address.");
      return;
    }

    setSaving(true);
    try {
      const customer = await api.createCustomer({ name, address });
      onCreated(customer);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save customer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add a customer"
      description="A customer record is saved as soon as you add these details."
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="label" htmlFor="customer-name">
            Customer name
          </label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              id="customer-name"
              className="field pl-10"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Jennifer Walsh"
              maxLength={120}
              autoFocus
              autoComplete="name"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="customer-address">
            Property address
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              id="customer-address"
              className="field pl-10"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="e.g. 1428 Evergreen Lane, Raleigh, NC"
              maxLength={240}
              autoComplete="street-address"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            This address is included in the AI brief for record accuracy.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save customer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
