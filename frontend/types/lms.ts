export type LmsRecordStatus = "ACTIVE" | "INACTIVE";

export interface LmsPaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface Organization {
  id: string;
  code: string;
  name: string;
  status: LmsRecordStatus;
  contactEmail: string | null;
  contactPhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
}

export interface OrganizationRequest {
  code: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface School {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  board: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
  status: LmsRecordStatus;
}

export interface SchoolRequest {
  organizationId: string;
  code: string;
  name: string;
  board?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface Student {
  id: string;
  organizationId: string;
  schoolId: string;
  classroomId: string;
  admissionNo: string;
  rollNo: string | null;
  firstName: string;
  lastName: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  enrolledAt: string | null;
  status: LmsRecordStatus;
}

export interface StudentRequest {
  organizationId: string;
  schoolId: string;
  classroomId: string;
  admissionNo: string;
  rollNo?: string;
  firstName: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  enrolledAt?: string;
}
