"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  activateOrganization,
  createOrganization,
  deactivateOrganization,
  listOrganizations,
  updateOrganization,
} from "@/services/lms-api";
import { AddressFields } from "@/components/lms/address-fields";
import { ContactFields } from "@/components/lms/contact-fields";
import { LmsTextField } from "@/components/lms/lms-text-field";
import type { Organization } from "@/types/lms";

type OrganizationFormState = {
  code: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
};

const initialForm: OrganizationFormState = {
  code: "",
  name: "",
  contactEmail: "",
  contactPhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
};

export default function OrganizationManagementPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [form, setForm] = useState<OrganizationFormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadOrganizations() {
    setLoading(true);
    setError(null);

    try {
      const response = await listOrganizations(1, 100);
      setOrganizations(response.content);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load organizations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrganizations();
  }, []);

  function startEdit(organization: Organization) {
    setEditingId(organization.id);
    setForm({
      code: organization.code,
      name: organization.name,
      contactEmail: organization.contactEmail ?? "",
      contactPhone: organization.contactPhone ?? "",
      addressLine1: organization.addressLine1 ?? "",
      addressLine2: organization.addressLine2 ?? "",
      city: organization.city ?? "",
      state: organization.state ?? "",
      country: organization.country ?? "",
      pincode: organization.pincode ?? "",
    });
    setMessage(null);
    setError(null);
  }

  function clearForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        code: form.code.toUpperCase(),
        name: form.name,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        addressLine1: form.addressLine1 || undefined,
        addressLine2: form.addressLine2 || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country || undefined,
        pincode: form.pincode || undefined,
      };

      if (editingId) {
        const updated = await updateOrganization(editingId, payload);
        setMessage(`Organization updated: ${updated.code}`);
      } else {
        const created = await createOrganization(payload);
        setMessage(`Organization created: ${created.code}`);
      }

      clearForm();
      await loadOrganizations();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save organization.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(organization: Organization) {
    setError(null);
    setMessage(null);

    try {
      if (organization.status === "ACTIVE") {
        await deactivateOrganization(organization.id);
        setMessage(`Organization deactivated: ${organization.code}`);
      } else {
        await activateOrganization(organization.id);
        setMessage(`Organization activated: ${organization.code}`);
      }
      await loadOrganizations();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to change organization status.");
    }
  }

  return (
    <main className="min-h-[calc(100vh-7rem)] rounded-xl bg-[#f8fafc] p-4 text-zinc-900 dark:bg-[#0b0f15] dark:text-zinc-100">
      <section className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="display-face text-2xl font-semibold">Organization Management</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Dedicated route to manage organization CRUD.</p>
        {message ? <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">{editingId ? "Edit Organization" : "Create Organization"}</h2>
          <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
            <LmsTextField
              required
              label="Code"
              value={form.code}
              onChange={(code) => setForm((prev) => ({ ...prev, code: code.toUpperCase() }))}
              placeholder="ORG-GAMMA"
            />
            <LmsTextField
              required
              label="Name"
              value={form.name}
              onChange={(name) => setForm((prev) => ({ ...prev, name }))}
              placeholder="Gamma Education Trust"
            />
            <ContactFields
              values={{
                contactEmail: form.contactEmail,
                contactPhone: form.contactPhone,
              }}
              onChange={(next) =>
                setForm((prev) => ({
                  ...prev,
                  contactEmail: next.contactEmail,
                  contactPhone: next.contactPhone,
                }))
              }
            />
            <AddressFields
              values={{
                addressLine1: form.addressLine1,
                addressLine2: form.addressLine2,
                city: form.city,
                state: form.state,
                country: form.country,
                pincode: form.pincode,
              }}
              onChange={(next) =>
                setForm((prev) => ({
                  ...prev,
                  addressLine1: next.addressLine1,
                  addressLine2: next.addressLine2,
                  city: next.city,
                  state: next.state,
                  country: next.country,
                  pincode: next.pincode,
                }))
              }
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={clearForm}
                  className="rounded border border-zinc-300 px-3 py-2 text-sm font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Organizations</h2>
          {loading ? <p className="mt-3 text-sm text-zinc-500">Loading organizations...</p> : null}
          {!loading && !organizations.length ? <p className="mt-3 text-sm text-zinc-500">No organizations found.</p> : null}
          <ul className="mt-3 space-y-2">
            {organizations.map((organization) => (
              <li key={organization.id} className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{organization.code} - {organization.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{organization.status}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {organization.contactEmail ?? "-"} | {organization.contactPhone ?? "-"}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {organization.addressLine1 ?? "-"}, {organization.addressLine2 ?? "-"}, {organization.city ?? "-"}, {organization.state ?? "-"}, {organization.country ?? "-"} {organization.pincode ?? ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(organization)}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleStatus(organization)}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      {organization.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
