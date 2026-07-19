"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

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
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Exam Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage exam CRUD and lifecycle with section/question builder.
          </Typography>
          {message ? <Alert severity="success" sx={{ mt: 1.5 }}>{message}</Alert> : null}
          {error ? <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert> : null}
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" } }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId ? "Edit Exam" : "Create Exam"}</Typography>
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
                  setForm((prev) => ({ ...prev, organizationId, schoolId: "" }));
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
                label="School (Optional)"
                select
                size="small"
                value={form.schoolId}
                onChange={(event) => setForm((prev) => ({ ...prev, schoolId: event.target.value }))}
              >
                <MenuItem value="">Organization-wide exam</MenuItem>
                {schools.map((school) => (
                  <MenuItem key={school.id} value={school.id}>
                    {school.code} - {school.name}
                  </MenuItem>
                ))}
              </TextField>

              <LmsTextField required label="Code" value={form.code} onChange={(code) => setForm((prev) => ({ ...prev, code: code.toUpperCase() }))} placeholder="EXM-101" />
              <LmsTextField required label="Title" value={form.title} onChange={(title) => setForm((prev) => ({ ...prev, title }))} placeholder="Term 1 Practice Exam" />
              <LmsTextField label="Description" value={form.description} onChange={(description) => setForm((prev) => ({ ...prev, description }))} placeholder="Brief description" />

              <TextField
                label="Exam Type"
                select
                size="small"
                value={form.examType}
                onChange={(event) => setForm((prev) => ({ ...prev, examType: event.target.value as LmsExamType }))}
              >
                {EXAM_TYPES.map((examType) => (
                  <MenuItem key={examType} value={examType}>
                    {examType}
                  </MenuItem>
                ))}
              </TextField>

              <LmsTextField label="Starts At" type="datetime-local" value={form.startsAt} onChange={(startsAt) => setForm((prev) => ({ ...prev, startsAt }))} />
              <LmsTextField label="Ends At" type="datetime-local" value={form.endsAt} onChange={(endsAt) => setForm((prev) => ({ ...prev, endsAt }))} />
              <LmsTextField label="Duration Minutes" type="number" value={form.durationMinutes} onChange={(durationMinutes) => setForm((prev) => ({ ...prev, durationMinutes }))} placeholder="60" />
              <LmsTextField label="Total Marks" type="number" value={form.totalMarks} onChange={(totalMarks) => setForm((prev) => ({ ...prev, totalMarks }))} placeholder="100" />

              <Card variant="outlined" sx={{ mt: 0.5 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Section and Question Builder</Typography>
                    <Button type="button" onClick={addSection} variant="outlined" size="small">Add Section</Button>
                  </Box>

                  <Box sx={{ display: "grid", gap: 1.5 }}>
                    {sections.map((section, sectionIndex) => (
                      <Card key={section.key} variant="outlined">
                        <CardContent>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>Section {sectionIndex + 1}</Typography>
                            <Button type="button" onClick={() => removeSection(section.key)} variant="outlined" size="small">
                              Remove Section
                            </Button>
                          </Box>

                          <Box sx={{ display: "grid", gap: 1.5 }}>
                            <LmsTextField label="Section Title" value={section.title} onChange={(title) => updateSection(section.key, { title })} placeholder="General" />
                            <LmsTextField label="Section Description" value={section.description} onChange={(description) => updateSection(section.key, { description })} placeholder="Section note" />
                            <LmsTextField label="Section Max Marks" type="number" value={section.maxMarks} onChange={(maxMarks) => updateSection(section.key, { maxMarks })} placeholder="10" />

                            <Box sx={{ display: "grid", gap: 1 }}>
                              {section.questions.map((question, questionIndex) => (
                                <Card key={question.key} variant="outlined">
                                  <CardContent>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Question {questionIndex + 1}</Typography>
                                      <Button
                                        type="button"
                                        onClick={() => removeQuestion(section.key, question.key)}
                                        variant="outlined"
                                        size="small"
                                      >
                                        Remove Question
                                      </Button>
                                    </Box>

                                    <Box sx={{ display: "grid", gap: 1.5 }}>
                                      <TextField
                                        label="Question Type"
                                        select
                                        size="small"
                                        value={question.questionType}
                                        onChange={(event) => updateQuestion(section.key, question.key, { questionType: event.target.value as QuestionType })}
                                      >
                                        {QUESTION_TYPES.map((questionType) => (
                                          <MenuItem key={questionType} value={questionType}>
                                            {questionType}
                                          </MenuItem>
                                        ))}
                                      </TextField>

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
                                        <Card variant="outlined">
                                          <CardContent>
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                                              <Typography variant="caption" sx={{ fontWeight: 700 }}>Options</Typography>
                                              <Button type="button" onClick={() => addOption(section.key, question.key)} variant="outlined" size="small">
                                                Add Option
                                              </Button>
                                            </Box>
                                            <Box sx={{ display: "grid", gap: 1 }}>
                                              {question.options.map((option) => (
                                                <Box
                                                  key={option.key}
                                                  sx={{
                                                    display: "grid",
                                                    gap: 1,
                                                    gridTemplateColumns: { xs: "1fr", sm: "1fr auto auto" },
                                                    alignItems: "center",
                                                  }}
                                                >
                                                  <TextField
                                                    label="Option Text"
                                                    size="small"
                                                    value={option.optionText}
                                                    onChange={(event) => updateOption(section.key, question.key, option.key, { optionText: event.target.value })}
                                                  />
                                                  <FormControlLabel
                                                    control={
                                                      <Checkbox
                                                        checked={option.correct}
                                                        onChange={(event) =>
                                                          updateOption(section.key, question.key, option.key, { correct: event.target.checked })
                                                        }
                                                      />
                                                    }
                                                    label="Correct"
                                                    sx={{ m: 0 }}
                                                  />
                                                  <Button
                                                    type="button"
                                                    onClick={() => removeOption(section.key, question.key, option.key)}
                                                    variant="outlined"
                                                    size="small"
                                                  >
                                                    Remove
                                                  </Button>
                                                </Box>
                                              ))}
                                            </Box>
                                          </CardContent>
                                        </Card>
                                      ) : null}
                                    </Box>
                                  </CardContent>
                                </Card>
                              ))}

                              <Button type="button" onClick={() => addQuestion(section.key)} variant="outlined" size="small" sx={{ width: "fit-content" }}>
                                Add Question
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  type="submit"
                  disabled={saving || !form.organizationId || !form.code || !form.title}
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
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Exams</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
                  sx={{ minWidth: 130 }}
                >
                  <MenuItem value="">All schools</MenuItem>
                  {schools.map((school) => (
                    <MenuItem key={school.id} value={school.id}>
                      {school.code}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Type"
                  value={selectedExamType}
                  onChange={(event) => setSelectedExamType(event.target.value)}
                  sx={{ minWidth: 130 }}
                >
                  <MenuItem value="">All types</MenuItem>
                  {EXAM_TYPES.map((examType) => (
                    <MenuItem key={examType} value={examType}>
                      {examType}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            {loading ? <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>Loading exams...</Typography> : null}
            {!loading && !exams.length ? <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>No exams found.</Typography> : null}

            <Box sx={{ mt: 1.5, display: "grid", gap: 1 }}>
              {exams.map((exam) => (
                <Card key={exam.id} variant="outlined">
                  <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{exam.code} - {exam.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {orgLabelById.get(exam.organizationId) ?? exam.organizationId} | {exam.schoolId ? schoolLabelById.get(exam.schoolId) ?? exam.schoolId : "ORG"} | {exam.examType} | {exam.status}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          Duration: {exam.durationMinutes ?? "-"} mins | Marks: {exam.totalMarks ?? "-"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button type="button" onClick={() => startEdit(exam)} variant="outlined" size="small">Edit</Button>
                        <Button type="button" onClick={() => void toggleStatus(exam)} variant="outlined" size="small">
                          {exam.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
