"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  activateExam,
  createExam,
  deactivateExam,
  listExams,
  listOrganizations,
  listSchools,
  updateExam,
} from "@/services/lms-api";
import { LmsTextField } from "@/components/lms/lms-text-field";
import type { Exam, LmsExamType, Organization, School } from "@/types/lms";

type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "LONG_ANSWER" | "NUMERIC";

type OptionDraft = {
  key: string;
  optionText: string;
  correct: boolean;
};

type QuestionDraft = {
  key: string;
  questionType: QuestionType;
  questionText: string;
  marks: string;
  mandatory: boolean;
  options: OptionDraft[];
};

type SectionDraft = {
  key: string;
  title: string;
  description: string;
  maxMarks: string;
  questions: QuestionDraft[];
};

type ExamFormState = {
  organizationId: string;
  schoolId: string;
  code: string;
  title: string;
  description: string;
  examType: LmsExamType;
  startsAt: string;
  endsAt: string;
  durationMinutes: string;
  totalMarks: string;
};

const EXAM_TYPES: LmsExamType[] = ["OLYMPIAD", "SCHOOL", "CUSTOM", "COMPETITIVE", "PRACTICE"];

const QUESTION_TYPES: QuestionType[] = [
  "SHORT_ANSWER",
  "LONG_ANSWER",
  "NUMERIC",
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
];

const initialForm: ExamFormState = {
  organizationId: "",
  schoolId: "",
  code: "",
  title: "",
  description: "",
  examType: "SCHOOL",
  startsAt: "",
  endsAt: "",
  durationMinutes: "",
  totalMarks: "",
};

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createDefaultQuestion(): QuestionDraft {
  return {
    key: uid("q"),
    questionType: "SHORT_ANSWER",
    questionText: "",
    marks: "1",
    mandatory: true,
    options: [],
  };
}

function createDefaultSection(): SectionDraft {
  return {
    key: uid("s"),
    title: "General",
    description: "",
    maxMarks: "1",
    questions: [createDefaultQuestion()],
  };
}

function isChoiceQuestion(questionType: QuestionType): boolean {
  return questionType === "SINGLE_CHOICE" || questionType === "MULTIPLE_CHOICE" || questionType === "TRUE_FALSE";
}

function toIsoDateTime(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  return new Date(value).toISOString();
}

export default function ExamManagementPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedExamType, setSelectedExamType] = useState<string>("");

  const [form, setForm] = useState<ExamFormState>(initialForm);
  const [sections, setSections] = useState<SectionDraft[]>([createDefaultSection()]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const orgLabelById = useMemo(() => {
    return new Map(organizations.map((organization) => [organization.id, organization.code]));
  }, [organizations]);

  const schoolLabelById = useMemo(() => {
    return new Map(schools.map((school) => [school.id, school.code]));
  }, [schools]);

  useEffect(() => {
    async function loadOrganizationsAndDefaults() {
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

    void loadOrganizationsAndDefaults();
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
        setForm((prev) => ({
          ...prev,
          organizationId: selectedOrg,
          schoolId: prev.schoolId && response.content.some((school) => school.id === prev.schoolId) ? prev.schoolId : "",
        }));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load schools.");
      }
    }

    void loadSchoolOptions();
  }, [selectedOrg]);

  useEffect(() => {
    async function loadExamRows() {
      setLoading(true);
      setError(null);

      try {
        const response = await listExams(1, 200, {
          organizationId: selectedOrg || undefined,
          schoolId: selectedSchool || undefined,
          examType: selectedExamType || undefined,
        });
        setExams(response.content);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load exams.");
      } finally {
        setLoading(false);
      }
    }

    void loadExamRows();
  }, [selectedOrg, selectedSchool, selectedExamType]);

  function addSection() {
    setSections((prev) => [...prev, createDefaultSection()]);
  }

  function removeSection(sectionKey: string) {
    setSections((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((section) => section.key !== sectionKey);
    });
  }

  function updateSection(sectionKey: string, update: Partial<SectionDraft>) {
    setSections((prev) => prev.map((section) => (section.key === sectionKey ? { ...section, ...update } : section)));
  }

  function addQuestion(sectionKey: string) {
    setSections((prev) =>
      prev.map((section) =>
        section.key === sectionKey ? { ...section, questions: [...section.questions, createDefaultQuestion()] } : section,
      ),
    );
  }

  function removeQuestion(sectionKey: string, questionKey: string) {
    setSections((prev) =>
      prev.map((section) => {
        if (section.key !== sectionKey) {
          return section;
        }
        if (section.questions.length <= 1) {
          return section;
        }
        return { ...section, questions: section.questions.filter((question) => question.key !== questionKey) };
      }),
    );
  }

  function updateQuestion(sectionKey: string, questionKey: string, update: Partial<QuestionDraft>) {
    setSections((prev) =>
      prev.map((section) => {
        if (section.key !== sectionKey) {
          return section;
        }
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.key !== questionKey) {
              return question;
            }

            const nextQuestion = { ...question, ...update };
            if (!isChoiceQuestion(nextQuestion.questionType)) {
              nextQuestion.options = [];
            }
            return nextQuestion;
          }),
        };
      }),
    );
  }

  function addOption(sectionKey: string, questionKey: string) {
    setSections((prev) =>
      prev.map((section) => {
        if (section.key !== sectionKey) {
          return section;
        }
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.key !== questionKey) {
              return question;
            }
            return {
              ...question,
              options: [...question.options, { key: uid("opt"), optionText: "", correct: false }],
            };
          }),
        };
      }),
    );
  }

  function removeOption(sectionKey: string, questionKey: string, optionKey: string) {
    setSections((prev) =>
      prev.map((section) => {
        if (section.key !== sectionKey) {
          return section;
        }
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.key !== questionKey) {
              return question;
            }
            return {
              ...question,
              options: question.options.filter((option) => option.key !== optionKey),
            };
          }),
        };
      }),
    );
  }

  function updateOption(sectionKey: string, questionKey: string, optionKey: string, update: Partial<OptionDraft>) {
    setSections((prev) =>
      prev.map((section) => {
        if (section.key !== sectionKey) {
          return section;
        }
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.key !== questionKey) {
              return question;
            }
            return {
              ...question,
              options: question.options.map((option) => (option.key === optionKey ? { ...option, ...update } : option)),
            };
          }),
        };
      }),
    );
  }

  function clearBuilder() {
    setSections([createDefaultSection()]);
  }

  function startEdit(exam: Exam) {
    setEditingId(exam.id);
    setForm((prev) => ({
      ...prev,
      organizationId: exam.organizationId,
      schoolId: exam.schoolId ?? "",
      code: exam.code,
      title: exam.title,
      description: exam.description ?? "",
      examType: exam.examType,
      startsAt: exam.startsAt ? new Date(exam.startsAt).toISOString().slice(0, 16) : "",
      endsAt: exam.endsAt ? new Date(exam.endsAt).toISOString().slice(0, 16) : "",
      durationMinutes: exam.durationMinutes?.toString() ?? "",
      totalMarks: exam.totalMarks?.toString() ?? "",
    }));
    setSelectedOrg(exam.organizationId);
    setSelectedSchool(exam.schoolId ?? "");
    clearBuilder();
    setError(null);
    setMessage(null);
  }

  function clearForm() {
    setEditingId(null);
    setForm((prev) => ({
      ...initialForm,
      organizationId: selectedOrg || prev.organizationId,
      schoolId: selectedSchool || prev.schoolId,
    }));
    clearBuilder();
  }

  async function reloadExams() {
    const response = await listExams(1, 200, {
      organizationId: selectedOrg || undefined,
      schoolId: selectedSchool || undefined,
      examType: selectedExamType || undefined,
    });
    setExams(response.content);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (sections.length === 0) {
        throw new Error("At least one section is required.");
      }

      const durationMinutes = Number(form.durationMinutes);
      const totalMarks = Number(form.totalMarks);

      const payload = {
        organizationId: form.organizationId,
        schoolId: form.schoolId || undefined,
        code: form.code.toUpperCase(),
        title: form.title,
        description: form.description || undefined,
        examType: form.examType,
        startsAt: toIsoDateTime(form.startsAt),
        endsAt: toIsoDateTime(form.endsAt),
        durationMinutes: Number.isFinite(durationMinutes) && durationMinutes > 0 ? durationMinutes : undefined,
        totalMarks: Number.isFinite(totalMarks) && totalMarks > 0 ? totalMarks : undefined,
        sections: sections.map((section, sectionIndex) => {
          const sectionMaxMarks = Number(section.maxMarks);
          return {
            displayOrder: sectionIndex + 1,
            title: section.title || `Section ${sectionIndex + 1}`,
            description: section.description || undefined,
            maxMarks: Number.isFinite(sectionMaxMarks) && sectionMaxMarks > 0 ? sectionMaxMarks : undefined,
            questions: section.questions.map((question, questionIndex) => {
              const questionMarks = Number(question.marks);
              return {
                displayOrder: questionIndex + 1,
                questionType: question.questionType,
                questionText: question.questionText || `Question ${questionIndex + 1}`,
                marks: Number.isFinite(questionMarks) && questionMarks > 0 ? questionMarks : 1,
                mandatory: question.mandatory,
                options: isChoiceQuestion(question.questionType)
                  ? question.options
                      .filter((option) => option.optionText.trim().length > 0)
                      .map((option, optionIndex) => ({
                        displayOrder: optionIndex + 1,
                        optionText: option.optionText,
                        correct: option.correct,
                      }))
                  : [],
              };
            }),
          };
        }),
      };

      if (editingId) {
        const updated = await updateExam(editingId, payload);
        setMessage(`Exam updated: ${updated.code}`);
      } else {
        const created = await createExam(payload);
        setMessage(`Exam created: ${created.code}`);
      }

      clearForm();
      await reloadExams();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save exam.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(exam: Exam) {
    setError(null);
    setMessage(null);

    try {
      if (exam.status === "ACTIVE") {
        await deactivateExam(exam.id);
        setMessage(`Exam deactivated: ${exam.code}`);
      } else {
        await activateExam(exam.id);
        setMessage(`Exam activated: ${exam.code}`);
      }
      await reloadExams();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to change exam status.");
    }
  }

  return (
    <main className="min-h-[calc(100vh-7rem)] rounded-xl bg-[#f8fafc] p-4 text-zinc-900 dark:bg-[#0b0f15] dark:text-zinc-100">
      <section className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="display-face text-2xl font-semibold">Exam Management</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manage exam CRUD and lifecycle with section/question builder.</p>
        {message ? <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">{editingId ? "Edit Exam" : "Create Exam"}</h2>
          <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
            <label className="grid gap-1 text-sm">
              Organization
              <select
                required
                value={form.organizationId}
                onChange={(event) => {
                  const organizationId = event.target.value;
                  setSelectedOrg(organizationId);
                  setForm((prev) => ({ ...prev, organizationId, schoolId: "" }));
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
              School (Optional)
              <select
                value={form.schoolId}
                onChange={(event) => setForm((prev) => ({ ...prev, schoolId: event.target.value }))}
                className="rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="">Organization-wide exam</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.code} - {school.name}
                  </option>
                ))}
              </select>
            </label>

            <LmsTextField required label="Code" value={form.code} onChange={(code) => setForm((prev) => ({ ...prev, code: code.toUpperCase() }))} placeholder="EXM-101" />
            <LmsTextField required label="Title" value={form.title} onChange={(title) => setForm((prev) => ({ ...prev, title }))} placeholder="Term 1 Practice Exam" />
            <LmsTextField label="Description" value={form.description} onChange={(description) => setForm((prev) => ({ ...prev, description }))} placeholder="Brief description" />

            <label className="grid gap-1 text-sm">
              Exam Type
              <select
                value={form.examType}
                onChange={(event) => setForm((prev) => ({ ...prev, examType: event.target.value as LmsExamType }))}
                className="rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              >
                {EXAM_TYPES.map((examType) => (
                  <option key={examType} value={examType}>
                    {examType}
                  </option>
                ))}
              </select>
            </label>

            <LmsTextField label="Starts At" type="datetime-local" value={form.startsAt} onChange={(startsAt) => setForm((prev) => ({ ...prev, startsAt }))} />
            <LmsTextField label="Ends At" type="datetime-local" value={form.endsAt} onChange={(endsAt) => setForm((prev) => ({ ...prev, endsAt }))} />
            <LmsTextField label="Duration Minutes" type="number" value={form.durationMinutes} onChange={(durationMinutes) => setForm((prev) => ({ ...prev, durationMinutes }))} placeholder="60" />
            <LmsTextField label="Total Marks" type="number" value={form.totalMarks} onChange={(totalMarks) => setForm((prev) => ({ ...prev, totalMarks }))} placeholder="100" />

            <div className="mt-3 rounded border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Section and Question Builder</h3>
                <button
                  type="button"
                  onClick={addSection}
                  className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Add Section
                </button>
              </div>

              <div className="space-y-3">
                {sections.map((section, sectionIndex) => (
                  <div key={section.key} className="rounded border border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold">Section {sectionIndex + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeSection(section.key)}
                        className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        Remove Section
                      </button>
                    </div>

                    <LmsTextField label="Section Title" value={section.title} onChange={(title) => updateSection(section.key, { title })} placeholder="General" />
                    <LmsTextField label="Section Description" value={section.description} onChange={(description) => updateSection(section.key, { description })} placeholder="Section note" />
                    <LmsTextField label="Section Max Marks" type="number" value={section.maxMarks} onChange={(maxMarks) => updateSection(section.key, { maxMarks })} placeholder="10" />

                    <div className="mt-2 space-y-2">
                      {section.questions.map((question, questionIndex) => (
                        <div key={question.key} className="rounded border border-zinc-200 p-2 dark:border-zinc-800">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold">Question {questionIndex + 1}</p>
                            <button
                              type="button"
                              onClick={() => removeQuestion(section.key, question.key)}
                              className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                            >
                              Remove Question
                            </button>
                          </div>

                          <label className="grid gap-1 text-sm">
                            Question Type
                            <select
                              value={question.questionType}
                              onChange={(event) => updateQuestion(section.key, question.key, { questionType: event.target.value as QuestionType })}
                              className="rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                            >
                              {QUESTION_TYPES.map((questionType) => (
                                <option key={questionType} value={questionType}>
                                  {questionType}
                                </option>
                              ))}
                            </select>
                          </label>

                          <LmsTextField
                            required
                            label="Question Text"
                            value={question.questionText}
                            onChange={(questionText) => updateQuestion(section.key, question.key, { questionText })}
                            placeholder="Question text"
                          />
                          <LmsTextField
                            label="Marks"
                            type="number"
                            value={question.marks}
                            onChange={(marks) => updateQuestion(section.key, question.key, { marks })}
                            placeholder="1"
                          />

                          {isChoiceQuestion(question.questionType) ? (
                            <div className="mt-2 rounded border border-zinc-200 p-2 dark:border-zinc-800">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-semibold">Options</p>
                                <button
                                  type="button"
                                  onClick={() => addOption(section.key, question.key)}
                                  className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                                >
                                  Add Option
                                </button>
                              </div>
                              <div className="space-y-2">
                                {question.options.map((option) => (
                                  <div key={option.key} className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                                    <input
                                      value={option.optionText}
                                      onChange={(event) => updateOption(section.key, question.key, option.key, { optionText: event.target.value })}
                                      className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                                      placeholder="Option text"
                                    />
                                    <label className="inline-flex items-center gap-1 text-xs">
                                      <input
                                        type="checkbox"
                                        checked={option.correct}
                                        onChange={(event) => updateOption(section.key, question.key, option.key, { correct: event.target.checked })}
                                      />
                                      Correct
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => removeOption(section.key, question.key, option.key)}
                                      className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addQuestion(section.key)}
                        className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        Add Question
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !form.organizationId || !form.code || !form.title}
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
            <h2 className="text-lg font-semibold">Exams</h2>
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
              <select
                value={selectedExamType}
                onChange={(event) => setSelectedExamType(event.target.value)}
                className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="">All types</option>
                {EXAM_TYPES.map((examType) => (
                  <option key={examType} value={examType}>
                    {examType}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? <p className="mt-3 text-sm text-zinc-500">Loading exams...</p> : null}
          {!loading && !exams.length ? <p className="mt-3 text-sm text-zinc-500">No exams found.</p> : null}

          <ul className="mt-3 space-y-2">
            {exams.map((exam) => (
              <li key={exam.id} className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{exam.code} - {exam.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {orgLabelById.get(exam.organizationId) ?? exam.organizationId} | {exam.schoolId ? schoolLabelById.get(exam.schoolId) ?? exam.schoolId : "ORG"} | {exam.examType} | {exam.status}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Duration: {exam.durationMinutes ?? "-"} mins | Marks: {exam.totalMarks ?? "-"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(exam)}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleStatus(exam)}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      {exam.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
