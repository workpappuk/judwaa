"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import {
  activateStudent,
  createStudent,
  deactivateStudent,
  listClassrooms,
  listOrganizations,
  listSchools,
  listStudents,
  updateStudent,
} from "@/services/lms-api";
import { LmsTextField } from "@/components/lms/lms-text-field";
import type { Classroom, Organization, School, Student } from "@/types/lms";

type StudentFormState = {
  organizationId: string;
  schoolId: string;
  classroomId: string;
  admissionNo: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  guardianName: string;
  guardianPhone: string;
  enrolledAt: string;
};

const initialForm: StudentFormState = {
  organizationId: "",
  schoolId: "",
  classroomId: "",
  admissionNo: "",
  rollNo: "",
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  guardianName: "",
  guardianPhone: "",
  enrolledAt: "",
};

export default function StudentManagementPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");

  const [form, setForm] = useState<StudentFormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [manualClassroomEntry, setManualClassroomEntry] = useState(false);

  const orgLabelById = useMemo(() => {
    return new Map(organizations.map((organization) => [organization.id, organization.code]));
  }, [organizations]);

  const schoolLabelById = useMemo(() => {
    return new Map(schools.map((school) => [school.id, school.code]));
  }, [schools]);

  const classroomLabelById = useMemo(() => {
    return new Map(
      classrooms.map((classroom) => [
        classroom.id,
        `${classroom.academicYear} | Grade ${classroom.grade} ${classroom.section}${classroom.classTeacherName ? ` | ${classroom.classTeacherName}` : ""}`,
      ]),
    );
  }, [classrooms]);

  useEffect(() => {
    async function loadOrganizationsAndSetDefaults() {
      try {
        const response = await listOrganizations(1, 100);
        setOrganizations(response.content);
        if (response.content.length) {
          const defaultOrgId = response.content[0].id;
          setSelectedOrg(defaultOrgId);
          setForm((prev) => ({ ...prev, organizationId: defaultOrgId }));
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load organizations.");
      }
    }

    void loadOrganizationsAndSetDefaults();
  }, []);

  useEffect(() => {
    async function loadSchoolOptions() {
      if (!selectedOrg) {
        setSchools([]);
        return;
      }

      try {
        const response = await listSchools(1, 200, selectedOrg);
        setSchools(response.content);

        setSelectedSchool((prevSchoolId) => {
          if (prevSchoolId && response.content.some((school) => school.id === prevSchoolId)) {
            return prevSchoolId;
          }
          return response.content[0]?.id ?? "";
        });

        setForm((prev) => {
          const nextSchoolId =
            prev.schoolId && response.content.some((school) => school.id === prev.schoolId)
              ? prev.schoolId
              : (response.content[0]?.id ?? "");
          return {
            ...prev,
            organizationId: selectedOrg,
            schoolId: nextSchoolId,
          };
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load schools.");
      }
    }

    void loadSchoolOptions();
  }, [selectedOrg]);

  useEffect(() => {
    async function loadClassroomOptions() {
      if (!selectedSchool) {
        setClassrooms([]);
        return;
      }

      try {
        const response = await listClassrooms(1, 200, {
          organizationId: selectedOrg || undefined,
          schoolId: selectedSchool,
        });
        setClassrooms(response.content);

        if (!manualClassroomEntry && response.content.length > 0 && !form.classroomId) {
          setForm((prev) => ({ ...prev, classroomId: response.content[0].id }));
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load classrooms.");
      }
    }

    void loadClassroomOptions();
  }, [selectedOrg, selectedSchool, manualClassroomEntry, form.classroomId]);

  useEffect(() => {
    async function loadStudentRows() {
      setLoading(true);
      setError(null);

      try {
        const response = await listStudents(1, 200, {
          organizationId: selectedOrg || undefined,
          schoolId: selectedSchool || undefined,
        });
        setStudents(response.content);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load students.");
      } finally {
        setLoading(false);
      }
    }

    void loadStudentRows();
  }, [selectedOrg, selectedSchool]);

  function startEdit(student: Student) {
    setEditingId(student.id);
    setForm({
      organizationId: student.organizationId,
      schoolId: student.schoolId,
      classroomId: student.classroomId,
      admissionNo: student.admissionNo,
      rollNo: student.rollNo ?? "",
      firstName: student.firstName,
      lastName: student.lastName ?? "",
      gender: student.gender ?? "",
      dateOfBirth: student.dateOfBirth ?? "",
      guardianName: student.guardianName ?? "",
      guardianPhone: student.guardianPhone ?? "",
      enrolledAt: student.enrolledAt ?? "",
    });
    setSelectedOrg(student.organizationId);
    setSelectedSchool(student.schoolId);
    setManualClassroomEntry(!classrooms.some((classroom) => classroom.id === student.classroomId));
    setError(null);
    setMessage(null);
  }

  function clearForm() {
    setEditingId(null);
    setManualClassroomEntry(false);
    setForm((prev) => ({
      ...initialForm,
      organizationId: selectedOrg || prev.organizationId,
      schoolId: selectedSchool || prev.schoolId,
      classroomId: classrooms[0]?.id ?? "",
    }));
  }

  async function loadStudentDataAfterSave() {
    const response = await listStudents(1, 200, {
      organizationId: selectedOrg || undefined,
      schoolId: selectedSchool || undefined,
    });
    setStudents(response.content);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        organizationId: form.organizationId,
        schoolId: form.schoolId,
        classroomId: form.classroomId,
        admissionNo: form.admissionNo,
        rollNo: form.rollNo || undefined,
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        guardianName: form.guardianName || undefined,
        guardianPhone: form.guardianPhone || undefined,
        enrolledAt: form.enrolledAt || undefined,
      };

      if (editingId) {
        const updated = await updateStudent(editingId, payload);
        setMessage(`Student updated: ${updated.admissionNo}`);
      } else {
        const created = await createStudent(payload);
        setMessage(`Student created: ${created.admissionNo}`);
      }

      clearForm();
      await loadStudentDataAfterSave();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save student.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(student: Student) {
    setError(null);
    setMessage(null);

    try {
      if (student.status === "ACTIVE") {
        await deactivateStudent(student.id);
        setMessage(`Student deactivated: ${student.admissionNo}`);
      } else {
        await activateStudent(student.id);
        setMessage(`Student activated: ${student.admissionNo}`);
      }

      await loadStudentDataAfterSave();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to change student status.");
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Student Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage student profile CRUD and activation lifecycle.
          </Typography>
          {message ? <Alert severity="success" sx={{ mt: 1.5 }}>{message}</Alert> : null}
          {error ? <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert> : null}
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" } }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId ? "Edit Student" : "Create Student"}</Typography>
            <Box component="form" sx={{ mt: 1.5, display: "grid", gap: 1.5 }} onSubmit={handleSubmit}>
              <TextField
                label="Organization"
                select
                required
                size="small"
                value={form.organizationId}
                onChange={(event) => {
                  const organizationId = event.target.value;
                  setSelectedOrg(organizationId);
                  setForm((prev) => ({ ...prev, organizationId }));
                }}
              >
                {!organizations.length ? <MenuItem value="">No organizations found</MenuItem> : null}
                {organizations.map((organization) => (
                  <MenuItem key={organization.id} value={organization.id}>
                    {organization.code} - {organization.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="School"
                select
                required
                size="small"
                value={form.schoolId}
                onChange={(event) => {
                  const schoolId = event.target.value;
                  setSelectedSchool(schoolId);
                  setForm((prev) => ({ ...prev, schoolId }));
                }}
              >
                {!schools.length ? <MenuItem value="">No schools found</MenuItem> : null}
                {schools.map((school) => (
                  <MenuItem key={school.id} value={school.id}>
                    {school.code} - {school.name}
                  </MenuItem>
                ))}
              </TextField>

              {!manualClassroomEntry ? (
                <TextField
                  label="Classroom"
                  select
                  required
                  size="small"
                  value={form.classroomId}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "__manual__") {
                      setManualClassroomEntry(true);
                      setForm((prev) => ({ ...prev, classroomId: "" }));
                      return;
                    }
                    setForm((prev) => ({ ...prev, classroomId: value }));
                  }}
                >
                  {!classrooms.length ? <MenuItem value="">No classrooms found</MenuItem> : null}
                  {classrooms.map((classroom) => (
                    <MenuItem key={classroom.id} value={classroom.id}>
                      {classroomLabelById.get(classroom.id) ?? classroom.id}
                    </MenuItem>
                  ))}
                  <MenuItem value="__manual__">Enter classroom ID manually</MenuItem>
                </TextField>
              ) : (
                <>
                  <LmsTextField
                    required
                    label="Classroom ID"
                    value={form.classroomId}
                    onChange={(classroomId) => setForm((prev) => ({ ...prev, classroomId }))}
                    placeholder="UUID of classroom"
                  />
                  {classrooms.length > 0 ? (
                    <Button
                      type="button"
                      onClick={() => {
                        setManualClassroomEntry(false);
                        setForm((prev) => ({ ...prev, classroomId: classrooms[0].id }));
                      }}
                      variant="outlined"
                      size="small"
                      sx={{ width: "fit-content" }}
                    >
                      Use classroom list
                    </Button>
                  ) : null}
                </>
              )}

              <LmsTextField
                required
                label="Admission No"
                value={form.admissionNo}
                onChange={(admissionNo) => setForm((prev) => ({ ...prev, admissionNo }))}
                placeholder="ADM-1001"
              />
              <LmsTextField
                label="Roll No"
                value={form.rollNo}
                onChange={(rollNo) => setForm((prev) => ({ ...prev, rollNo }))}
                placeholder="R-12"
              />
              <LmsTextField
                required
                label="First Name"
                value={form.firstName}
                onChange={(firstName) => setForm((prev) => ({ ...prev, firstName }))}
                placeholder="Aarav"
              />
              <LmsTextField
                label="Last Name"
                value={form.lastName}
                onChange={(lastName) => setForm((prev) => ({ ...prev, lastName }))}
                placeholder="Sharma"
              />
              <LmsTextField
                label="Gender"
                value={form.gender}
                onChange={(gender) => setForm((prev) => ({ ...prev, gender: gender.toUpperCase() }))}
                placeholder="MALE / FEMALE / OTHER"
              />
              <LmsTextField
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(dateOfBirth) => setForm((prev) => ({ ...prev, dateOfBirth }))}
              />
              <LmsTextField
                label="Guardian Name"
                value={form.guardianName}
                onChange={(guardianName) => setForm((prev) => ({ ...prev, guardianName }))}
                placeholder="Parent Name"
              />
              <LmsTextField
                label="Guardian Phone"
                value={form.guardianPhone}
                onChange={(guardianPhone) => setForm((prev) => ({ ...prev, guardianPhone }))}
                placeholder="9876543210"
              />
              <LmsTextField
                label="Enrolled At"
                type="date"
                value={form.enrolledAt}
                onChange={(enrolledAt) => setForm((prev) => ({ ...prev, enrolledAt }))}
              />

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  type="submit"
                  disabled={saving || !form.organizationId || !form.schoolId || !form.classroomId}
                  variant="contained"
                  size="small"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </Button>
                {editingId ? (
                  <Button type="button" onClick={clearForm} variant="outlined" size="small">
                    Cancel Edit
                  </Button>
                ) : null}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Students</Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  select
                  size="small"
                  label="Organization"
                  value={selectedOrg}
                  onChange={(event) => setSelectedOrg(event.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="">All organizations</MenuItem>
                  {organizations.map((organization) => (
                    <MenuItem key={organization.id} value={organization.id}>
                      {organization.code}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="School"
                  value={selectedSchool}
                  onChange={(event) => setSelectedSchool(event.target.value)}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">All schools</MenuItem>
                  {schools.map((school) => (
                    <MenuItem key={school.id} value={school.id}>
                      {school.code}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            {loading ? <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>Loading students...</Typography> : null}
            {!loading && !students.length ? <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>No students found.</Typography> : null}

            <Box sx={{ mt: 1.5, display: "grid", gap: 1 }}>
              {students.map((student) => (
                <Card key={student.id} variant="outlined">
                  <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {student.admissionNo} - {student.firstName} {student.lastName ?? ""}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {orgLabelById.get(student.organizationId) ?? student.organizationId} | {schoolLabelById.get(student.schoolId) ?? student.schoolId} | {student.status}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          Classroom: {classroomLabelById.get(student.classroomId) ?? student.classroomId} | Roll: {student.rollNo ?? "-"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button type="button" onClick={() => startEdit(student)} variant="outlined" size="small">Edit</Button>
                        <Button type="button" onClick={() => void toggleStatus(student)} variant="outlined" size="small">
                          {student.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
