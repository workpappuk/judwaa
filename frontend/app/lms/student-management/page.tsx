"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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
    <main className="min-h-[calc(100vh-7rem)] rounded-xl bg-[#f8fafc] p-4 text-zinc-900 dark:bg-[#0b0f15] dark:text-zinc-100">
      <section className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="display-face text-2xl font-semibold">Student Management</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage student profile CRUD and activation lifecycle.
        </p>
        {message ? <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">{editingId ? "Edit Student" : "Create Student"}</h2>
          <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
            <label className="grid gap-1 text-sm">
              Organization
              <select
                required
                value={form.organizationId}
                onChange={(event) => {
                  const organizationId = event.target.value;
                  setSelectedOrg(organizationId);
                  setForm((prev) => ({ ...prev, organizationId }));
                }}
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

            <label className="grid gap-1 text-sm">
              School
              <select
                required
                value={form.schoolId}
                onChange={(event) => {
                  const schoolId = event.target.value;
                  setSelectedSchool(schoolId);
                  setForm((prev) => ({ ...prev, schoolId }));
                }}
                className="rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              >
                {!schools.length ? <option value="">No schools found</option> : null}
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.code} - {school.name}
                  </option>
                ))}
              </select>
            </label>

            {!manualClassroomEntry ? (
              <label className="grid gap-1 text-sm">
                Classroom
                <select
                  required
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
                  className="rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  {!classrooms.length ? <option value="">No classrooms found</option> : null}
                    {classrooms.map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroomLabelById.get(classroom.id) ?? classroom.id}
                    </option>
                  ))}
                  <option value="__manual__">Enter classroom ID manually</option>
                </select>
              </label>
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
                  <button
                    type="button"
                    onClick={() => {
                      setManualClassroomEntry(false);
                      setForm((prev) => ({ ...prev, classroomId: classrooms[0].id }));
                    }}
                    className="w-fit rounded border border-zinc-300 px-3 py-2 text-sm font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Use classroom list
                  </button>
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

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !form.organizationId || !form.schoolId || !form.classroomId}
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
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Students</h2>
            <div className="flex gap-2">
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
              <select
                value={selectedSchool}
                onChange={(event) => setSelectedSchool(event.target.value)}
                className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="">All schools</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? <p className="mt-3 text-sm text-zinc-500">Loading students...</p> : null}
          {!loading && !students.length ? <p className="mt-3 text-sm text-zinc-500">No students found.</p> : null}

          <ul className="mt-3 space-y-2">
            {students.map((student) => (
              <li key={student.id} className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {student.admissionNo} - {student.firstName} {student.lastName ?? ""}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {orgLabelById.get(student.organizationId) ?? student.organizationId} | {schoolLabelById.get(student.schoolId) ?? student.schoolId} | {student.status}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Classroom: {classroomLabelById.get(student.classroomId) ?? student.classroomId} | Roll: {student.rollNo ?? "-"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(student)}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleStatus(student)}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      {student.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
