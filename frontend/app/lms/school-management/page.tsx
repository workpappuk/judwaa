"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Container, MenuItem, TextField, Typography } from "@mui/material";

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
  boardsInput: string;
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
  boardsInput: "",
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
      boardsInput: school.boards?.join(", ") ?? "",
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
      const boards = form.boardsInput
        .split(",")
        .map((board) => board.trim())
        .filter((board) => board.length > 0);

      const payload = {
        organizationId: form.organizationId,
        code: form.code.toUpperCase(),
        name: form.name,
        boards: boards.length > 0 ? boards : undefined,
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
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>School Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Dedicated route to manage school CRUD.</Typography>
          {message ? <Alert severity="success" sx={{ mt: 1.5 }}>{message}</Alert> : null}
          {error ? <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert> : null}
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" } }}>
        <Card variant="outlined">
          <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId ? "Edit School" : "Create School"}</Typography>
          <Box component="form" sx={{ mt: 1.5, display: "grid", gap: 1.5 }} onSubmit={handleSubmit}>
            <TextField
              label="Organization"
              select
              required
              size="small"
              value={form.organizationId}
              onChange={(event) => setForm((prev) => ({ ...prev, organizationId: event.target.value }))}
            >
              {!organizations.length ? <MenuItem value="">No organizations found</MenuItem> : null}
              {organizations.map((organization) => (
                <MenuItem key={organization.id} value={organization.id}>
                  {organization.code} - {organization.name}
                </MenuItem>
              ))}
            </TextField>
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
              label="Boards"
              value={form.boardsInput}
              onChange={(boardsInput) => setForm((prev) => ({ ...prev, boardsInput }))}
              placeholder="CBSE, ICSE"
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
            <Button
              type="submit"
              disabled={saving || !form.organizationId}
              variant="contained"
              size="small"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Schools</Typography>
            <TextField
              select
              size="small"
              label="Organization"
              value={selectedOrg}
              onChange={(event) => setSelectedOrg(event.target.value)}
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="">All organizations</MenuItem>
              {organizations.map((organization) => (
                <MenuItem key={organization.id} value={organization.id}>
                  {organization.code}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          {loading ? <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>Loading schools...</Typography> : null}
          {!loading && !schools.length ? <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>No schools found.</Typography> : null}
          <Box sx={{ mt: 1.5, display: "grid", gap: 1 }}>
            {schools.map((school) => (
              <Card key={school.id} variant="outlined">
                <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{school.code} - {school.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{orgLabelById.get(school.organizationId) ?? school.organizationId} | {school.status}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Boards: {school.boards?.join(", ") || "-"}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {school.addressLine1 ?? "-"}, {school.addressLine2 ?? "-"}, {school.city ?? "-"}, {school.state ?? "-"}, {school.country ?? "-"} {school.pincode ?? ""}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button type="button" onClick={() => startEdit(school)} variant="outlined" size="small">Edit</Button>
                    <Button type="button" onClick={() => void toggleStatus(school)} variant="outlined" size="small">
                      {school.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
