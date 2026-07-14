import axios from "axios";

import type {
  Classroom,
  Exam,
  ExamRequest,
  LmsPaginatedResponse,
  Organization,
  OrganizationRequest,
  School,
  SchoolRequest,
  Student,
  StudentRequest,
} from "@/types/lms";
import { createApiClient } from "@/services/api-client";

const lmsApi = createApiClient({ withAuth: true });

function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string" &&
      data.message.trim().length > 0
    ) {
      return data.message;
    }
  }

  return fallbackMessage;
}

export async function listSchools(page = 1, size = 20, organizationId?: string): Promise<LmsPaginatedResponse<School>> {
  const response = await lmsApi.get<LmsPaginatedResponse<School>>("/api/lms/schools", {
    params: {
      page,
      size,
      ...(organizationId ? { organizationId } : {}),
    },
  });

  return response.data;
}

export async function listClassrooms(
  page = 1,
  size = 20,
  filters?: { organizationId?: string; schoolId?: string },
): Promise<LmsPaginatedResponse<Classroom>> {
  const response = await lmsApi.get<LmsPaginatedResponse<Classroom>>("/api/lms/classrooms", {
    params: {
      page,
      size,
      ...(filters?.organizationId ? { organizationId: filters.organizationId } : {}),
      ...(filters?.schoolId ? { schoolId: filters.schoolId } : {}),
    },
  });

  return response.data;
}

export async function createOrganization(payload: OrganizationRequest): Promise<Organization> {
  try {
    const response = await lmsApi.post<Organization>("/api/lms/organizations", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to create organization right now."));
  }
}

export async function updateOrganization(id: string, payload: OrganizationRequest): Promise<Organization> {
  try {
    const response = await lmsApi.put<Organization>(`/api/lms/organizations/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update organization right now."));
  }
}

export async function listOrganizations(page = 1, size = 50): Promise<LmsPaginatedResponse<Organization>> {
  const response = await lmsApi.get<LmsPaginatedResponse<Organization>>("/api/lms/organizations", {
    params: { page, size },
  });

  return response.data;
}

export async function activateOrganization(id: string): Promise<void> {
  try {
    await lmsApi.put(`/api/lms/organizations/${id}/activate`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to activate organization right now."));
  }
}

export async function deactivateOrganization(id: string): Promise<void> {
  try {
    await lmsApi.put(`/api/lms/organizations/${id}/deactivate`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to deactivate organization right now."));
  }
}

export async function createSchool(payload: SchoolRequest): Promise<School> {
  try {
    const response = await lmsApi.post<School>("/api/lms/schools", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to create school right now."));
  }
}

export async function updateSchool(id: string, payload: SchoolRequest): Promise<School> {
  try {
    const response = await lmsApi.put<School>(`/api/lms/schools/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update school right now."));
  }
}

export async function activateSchool(id: string): Promise<void> {
  try {
    await lmsApi.put(`/api/lms/schools/${id}/activate`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to activate school right now."));
  }
}

export async function deactivateSchool(id: string): Promise<void> {
  try {
    await lmsApi.put(`/api/lms/schools/${id}/deactivate`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to deactivate school right now."));
  }
}

export async function listStudents(
  page = 1,
  size = 20,
  filters?: { organizationId?: string; schoolId?: string; classroomId?: string },
): Promise<LmsPaginatedResponse<Student>> {
  const response = await lmsApi.get<LmsPaginatedResponse<Student>>("/api/lms/students", {
    params: {
      page,
      size,
      ...(filters?.organizationId ? { organizationId: filters.organizationId } : {}),
      ...(filters?.schoolId ? { schoolId: filters.schoolId } : {}),
      ...(filters?.classroomId ? { classroomId: filters.classroomId } : {}),
    },
  });

  return response.data;
}

export async function createStudent(payload: StudentRequest): Promise<Student> {
  try {
    const response = await lmsApi.post<Student>("/api/lms/students", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to create student right now."));
  }
}

export async function updateStudent(id: string, payload: StudentRequest): Promise<Student> {
  try {
    const response = await lmsApi.put<Student>(`/api/lms/students/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update student right now."));
  }
}

export async function activateStudent(id: string): Promise<void> {
  try {
    await lmsApi.put(`/api/lms/students/${id}/activate`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to activate student right now."));
  }
}

export async function deactivateStudent(id: string): Promise<void> {
  try {
    await lmsApi.put(`/api/lms/students/${id}/deactivate`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to deactivate student right now."));
  }
}

export async function listExams(
  page = 1,
  size = 20,
  filters?: { organizationId?: string; schoolId?: string; examType?: string },
): Promise<LmsPaginatedResponse<Exam>> {
  const response = await lmsApi.get<LmsPaginatedResponse<Exam>>("/api/lms/exams", {
    params: {
      page,
      size,
      ...(filters?.organizationId ? { organizationId: filters.organizationId } : {}),
      ...(filters?.schoolId ? { schoolId: filters.schoolId } : {}),
      ...(filters?.examType ? { examType: filters.examType } : {}),
    },
  });

  return response.data;
}

export async function createExam(payload: ExamRequest): Promise<Exam> {
  try {
    const response = await lmsApi.post<Exam>("/api/lms/exams", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to create exam right now."));
  }
}

export async function updateExam(id: string, payload: ExamRequest): Promise<Exam> {
  try {
    const response = await lmsApi.put<Exam>(`/api/lms/exams/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update exam right now."));
  }
}

export async function activateExam(id: string): Promise<void> {
  try {
    await lmsApi.put(`/api/lms/exams/${id}/activate`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to activate exam right now."));
  }
}

export async function deactivateExam(id: string): Promise<void> {
  try {
    await lmsApi.put(`/api/lms/exams/${id}/deactivate`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to deactivate exam right now."));
  }
}
