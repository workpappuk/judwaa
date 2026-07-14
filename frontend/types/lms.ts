export type LmsRecordStatus = "ACTIVE" | "INACTIVE";
export type LmsExamType = "OLYMPIAD" | "SCHOOL" | "CUSTOM" | "COMPETITIVE" | "PRACTICE";

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
  boards: string[] | null;
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
  boards?: string[];
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface Classroom {
  id: string;
  organizationId: string;
  schoolId: string;
  schoolCode: string;
  academicYear: string;
  grade: string;
  section: string;
  classTeacherName: string | null;
  status: LmsRecordStatus;
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

export interface ExamQuestionOptionRequest {
  displayOrder: number;
  optionText: string;
  correct: boolean;
}

export interface ExamQuestionRequest {
  displayOrder: number;
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "LONG_ANSWER" | "NUMERIC";
  questionText: string;
  marks: number;
  mandatory?: boolean;
  explanation?: string;
  options?: ExamQuestionOptionRequest[];
}

export interface ExamSectionRequest {
  displayOrder: number;
  title: string;
  description?: string;
  maxMarks?: number;
  questions: ExamQuestionRequest[];
}

export interface ExamRequest {
  organizationId: string;
  schoolId?: string;
  code: string;
  title: string;
  description?: string;
  examType: LmsExamType;
  startsAt?: string;
  endsAt?: string;
  durationMinutes?: number;
  totalMarks?: number;
  sections: ExamSectionRequest[];
}

export interface Exam {
  id: string;
  organizationId: string;
  schoolId: string | null;
  code: string;
  title: string;
  description: string | null;
  examType: LmsExamType;
  startsAt: string | null;
  endsAt: string | null;
  durationMinutes: number | null;
  totalMarks: number | null;
  status: LmsRecordStatus;
}
