"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  activateSchool,
  createSchool,
  deactivateSchool,
  listOrganizations,
  listSchools,
  updateSchool,
} from "@/services/lms-api";
import { AddressFields } from "@/components/lms/address-fields";
import { LmsTextField } from "@/components/lms/lms-text-field";
import type { Organization, School } from "@/types/lms";

type SchoolFormState = {
  organizationId: string;
  code: string;
  name: string;
  board: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
};

const initialForm: SchoolFormState = {
  organizationId: "",
  code: "",
  name: "",
  board: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
};

export default function SchoolManagementPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [form, setForm] = useState<SchoolFormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const orgLabelById = useMemo(() => {
    return new Map(organizations.map((organization) => [organization.id, organization.code]));
  }, [organizations]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [orgResponse, schoolResponse] = await Promise.all([
        listOrganizations(1, 100),
        listSchools(1, 200, selectedOrg || undefined),
      ]);
      setOrganizations(orgResponse.content);
      setSchools(schoolResponse.content);

      if (!form.organizationId && orgResponse.content.length) {
        setForm((prev) => ({ ...prev, organizationId: orgResponse.content[0].id }));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load schools.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [selectedOrg]);

  function startEdit(school: School) {
    setEditingId(school.id);
    setForm({
      organizationId: school.organizationId,
      code: school.code,
      name: school.name,
      board: school.board ?? "",
      addressLine1: school.addressLine1 ?? "",
      addressLine2: school.addressLine2 ?? "",
      city: school.city ?? "",
      state: school.state ?? "",
      country: school.country ?? "",
      pincode: school.pincode ?? "",
    });
    setMessage(null);
    setError(null);
  }

  function clearForm() {
    setEditingId(null);
    setForm((prev) => ({ ...initialForm, organizationId: prev.organizationId || organizations[0]?.id || "" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        organizationId: form.organizationId,
        code: form.code.toUpperCase(),
        name: form.name,
        board: form.board || undefined,
        addressLine1: form.addressLine1 || undefined,
        addressLine2: form.addressLine2 || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country || undefined,
        pincode: form.pincode || undefined,
      };

      if (editingId) {
        const updated = await updateSchool(editingId, payload);
        setMessage(`School updated: ${updated.code}`);
      } else {
        const created = await createSchool(payload);
        setMessage(`School created: ${created.code}`);
      }

      clearForm();
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save school.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(school: School) {
    setError(null);
    setMessage(null);

    try {
      if (school.status === "ACTIVE") {
        await deactivateSchool(school.id);
        setMessage(`School deactivated: ${school.code}`);
      } else {
        await activateSchool(school.id);
        setMessage(`School activated: ${school.code}`);
      }
      await loadData();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to change school status.");
    }
  }

  return (
    <main className="min-h-[calc(100vh-7rem)] rounded-xl bg-[#f8fafc] p-4 text-zinc-900 dark:bg-[#0b0f15] dark:text-zinc-100">
      <section className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="display-face text-2xl font-semibold">School Management</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Dedicated route to manage school CRUD.</p>
        {message ? <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">{editingId ? "Edit School" : "Create School"}</h2>
          <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
            <label className="grid gap-1 text-sm">
              Organization
              <select
                required
                value={form.organizationId}
                onChange={(event) => setForm((prev) => ({ ...prev, organizationId: event.target.value }))}
                className="rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              >
                {!organizations.length ? <option value="">No organizations found</option> : null}
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.code} - {organization.name}
                  </option>
                ))}
              </select>
            </label>
            <LmsTextField
              required
              label="Code"
              value={form.code}
              onChange={(code) => setForm((prev) => ({ ...prev, code: code.toUpperCase() }))}
              placeholder="SCH-501"
            />
            <LmsTextField
              required
              label="Name"
              value={form.name}
              onChange={(name) => setForm((prev) => ({ ...prev, name }))}
              placeholder="Sunrise School"
            />
            <LmsTextField
              label="Board"
              value={form.board}
              onChange={(board) => setForm((prev) => ({ ...prev, board }))}
              placeholder="State Board"
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
            <button
              type="submit"
              disabled={saving || !form.organizationId}
              className="rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Schools</h2>
            <select
              value={selectedOrg}
              onChange={(event) => setSelectedOrg(event.target.value)}
              className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">All organizations</option>
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.code}
                </option>
              ))}
            </select>
          </div>
          {loading ? <p className="mt-3 text-sm text-zinc-500">Loading schools...</p> : null}
          {!loading && !schools.length ? <p className="mt-3 text-sm text-zinc-500">No schools found.</p> : null}
          <ul className="mt-3 space-y-2">
            {schools.map((school) => (
              <li key={school.id} className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{school.code} - {school.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{orgLabelById.get(school.organizationId) ?? school.organizationId} | {school.status}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {school.addressLine1 ?? "-"}, {school.addressLine2 ?? "-"}, {school.city ?? "-"}, {school.state ?? "-"}, {school.country ?? "-"} {school.pincode ?? ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(school)}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleStatus(school)}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      {school.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
