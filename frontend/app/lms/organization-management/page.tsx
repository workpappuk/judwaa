"use client";

import { FormEvent, useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Container, Typography } from "@mui/material";

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
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Organization Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Dedicated route to manage organization CRUD.</Typography>
          {message ? <Alert severity="success" sx={{ mt: 1.5 }}>{message}</Alert> : null}
          {error ? <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert> : null}
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" } }}>
        <Card variant="outlined">
          <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId ? "Edit Organization" : "Create Organization"}</Typography>
          <Box component="form" sx={{ mt: 1.5, display: "grid", gap: 1.5 }} onSubmit={handleSubmit}>
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
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                type="submit"
                disabled={saving}
                variant="contained"
                size="small"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  onClick={clearForm}
                  variant="outlined"
                  size="small"
                >
                  Cancel Edit
                </Button>
              ) : null}
            </Box>
          </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Organizations</Typography>
          {loading ? <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>Loading organizations...</Typography> : null}
          {!loading && !organizations.length ? <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>No organizations found.</Typography> : null}
          <Box sx={{ mt: 1.5, display: "grid", gap: 1 }}>
            {organizations.map((organization) => (
              <Card key={organization.id} variant="outlined">
                <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{organization.code} - {organization.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{organization.status}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {organization.contactEmail ?? "-"} | {organization.contactPhone ?? "-"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {organization.addressLine1 ?? "-"}, {organization.addressLine2 ?? "-"}, {organization.city ?? "-"}, {organization.state ?? "-"}, {organization.country ?? "-"} {organization.pincode ?? ""}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      type="button"
                      onClick={() => startEdit(organization)}
                      variant="outlined"
                      size="small"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={() => void toggleStatus(organization)}
                      variant="outlined"
                      size="small"
                    >
                      {organization.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </Button>
                  </Box>
                </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
