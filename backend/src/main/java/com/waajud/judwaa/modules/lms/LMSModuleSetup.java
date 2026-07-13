package com.waajud.judwaa.modules.lms;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.waajud.judwaa.modules.lms.exam.entity.Exam;
import com.waajud.judwaa.modules.lms.exam.entity.ExamEnrollment;
import com.waajud.judwaa.modules.lms.exam.entity.ExamSection;
import com.waajud.judwaa.modules.lms.exam.entity.ExamType;
import com.waajud.judwaa.modules.lms.exam.entity.Question;
import com.waajud.judwaa.modules.lms.exam.entity.QuestionOption;
import com.waajud.judwaa.modules.lms.exam.entity.QuestionType;
import com.waajud.judwaa.modules.lms.exam.repository.ExamEnrollmentRepository;
import com.waajud.judwaa.modules.lms.exam.repository.ExamRepository;
import com.waajud.judwaa.modules.lms.school.entity.Classroom;
import com.waajud.judwaa.modules.lms.school.entity.School;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import com.waajud.judwaa.modules.lms.school.entity.Subject;
import com.waajud.judwaa.modules.lms.seed.CurrentClass;
import com.waajud.judwaa.modules.lms.seed.JsonClassroom;
import com.waajud.judwaa.modules.lms.seed.JsonExamEnrollmentSeed;
import com.waajud.judwaa.modules.lms.seed.JsonExamSectionSeed;
import com.waajud.judwaa.modules.lms.seed.JsonExamSeed;
import com.waajud.judwaa.modules.lms.seed.JsonQuestionOptionSeed;
import com.waajud.judwaa.modules.lms.seed.JsonQuestionSeed;
import com.waajud.judwaa.modules.lms.seed.JsonStudent;
import com.waajud.judwaa.modules.lms.seed.Trust;
import com.waajud.judwaa.modules.lms.school.repository.ClassroomRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolOrganizationRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolRepository;
import com.waajud.judwaa.modules.lms.school.repository.SubjectRepository;
import com.waajud.judwaa.modules.lms.student.entity.Student;
import com.waajud.judwaa.modules.lms.student.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration(proxyBeanMethods = false)
public class LMSModuleSetup {
    private static final Logger logger = LoggerFactory.getLogger(LMSModuleSetup.class);
    private static final String EXAM_SEED_FILE = "lms/seeds/exams.json";
    private static final String EXAM_ENROLLMENT_SEED_FILE = "lms/seeds/exam-enrollments.json";
  private static final String STUDENT_SEED_FILE = "lms/seeds/students.json";
  private static final String CLASSROOM_SEED_FILE = "lms/seeds/classrooms.json";
  private static final String TRUST_SEED_FILE = "lms/seeds/trusts.json";

    private final ObjectMapper objectMapper;
    private final SchoolOrganizationRepository schoolOrganizationRepository;
    private final  SchoolRepository schoolRepository;
    private final  ClassroomRepository classroomRepository;
    private final  SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final ExamRepository examRepository;
    private final ExamEnrollmentRepository examEnrollmentRepository;

    public LMSModuleSetup(ObjectMapper objectMapper, SchoolOrganizationRepository schoolOrganizationRepository, SchoolRepository schoolRepository,
                ClassroomRepository classroomRepository, SubjectRepository subjectRepository, StudentRepository studentRepository,
                ExamRepository examRepository, ExamEnrollmentRepository examEnrollmentRepository) {
        this.objectMapper = objectMapper;
        this.schoolOrganizationRepository = schoolOrganizationRepository;
        this.schoolRepository = schoolRepository;
        this.classroomRepository = classroomRepository;
        this.subjectRepository = subjectRepository;
        this.studentRepository = studentRepository;
      this.examRepository = examRepository;
      this.examEnrollmentRepository = examEnrollmentRepository;
    }

    @Bean
    public CommandLineRunner seedLMS(

    ) {
        return args -> {
          schoolOrgSetup();
          enrollStudents();
          seedExamWithQuestions();
                        enrollStudentsForExam();
			logger.info(
					"LMS final seed summary -> Organisations: {}, Schools: {}, Classrooms: {}, Subjects: {}, Students: {}, Exams: {}, Enrollments: {}",
					schoolOrganizationRepository.count(),
					schoolRepository.count(),
					classroomRepository.count(),
					subjectRepository.count(),
					studentRepository.count(),
					examRepository.count(),
					examEnrollmentRepository.count());
        };
    }

    private void seedExamWithQuestions() throws JsonProcessingException {
        List<JsonExamSeed> exams = readJsonResource(EXAM_SEED_FILE, new TypeReference<List<JsonExamSeed>>() {
        });

        int seeded = 0;
        for (JsonExamSeed examSeed : exams) {
            School school = schoolRepository.findByCode(examSeed.getSchoolCode());
            if (school == null) {
                logger.warn("Skipping exam seed: school {} not found", examSeed.getSchoolCode());
                continue;
            }

            SchoolOrganization organization = school.getOrganization();
            if (examRepository.existsByOrganizationIdAndCode(organization.getId(), examSeed.getCode())) {
                logger.info("Exam seed skipped: {} already exists", examSeed.getCode());
                continue;
            }

            Exam exam = new Exam();
            exam.setOrganization(organization);
            exam.setSchool(school);
            exam.setCode(examSeed.getCode());
            exam.setTitle(examSeed.getTitle());
            exam.setDescription(examSeed.getDescription());
            exam.setExamType(ExamType.valueOf(examSeed.getExamType()));
            exam.setDurationMinutes(examSeed.getDurationMinutes());
            exam.setTotalMarks(examSeed.getTotalMarks());

            Instant startsAt = Instant.now().plusSeconds((long) examSeed.getStartAfterMinutes() * 60L);
            exam.setStartsAt(startsAt);
            exam.setEndsAt(startsAt.plusSeconds((long) examSeed.getDurationMinutes() * 60L));

            for (JsonExamSectionSeed sectionSeed : examSeed.getSections()) {
                ExamSection section = new ExamSection();
                section.setDisplayOrder(sectionSeed.getDisplayOrder());
                section.setTitle(sectionSeed.getTitle());
                section.setDescription(sectionSeed.getDescription());
                section.setMaxMarks(sectionSeed.getMaxMarks());

                for (JsonQuestionSeed questionSeed : sectionSeed.getQuestions()) {
                    Question question = new Question();
                    question.setDisplayOrder(questionSeed.getDisplayOrder());
                    question.setQuestionType(QuestionType.valueOf(questionSeed.getQuestionType()));
                    question.setQuestionText(questionSeed.getQuestionText());
                    question.setMarks(questionSeed.getMarks());
                    question.setMandatory(questionSeed.isMandatory());

                    if (questionSeed.getOptions() != null) {
                        for (JsonQuestionOptionSeed optionSeed : questionSeed.getOptions()) {
                            QuestionOption option = new QuestionOption();
                            option.setDisplayOrder(optionSeed.getDisplayOrder());
                            option.setOptionText(optionSeed.getOptionText());
                            option.setCorrect(optionSeed.isCorrect());
                            question.addOption(option);
                        }
                    }

                    section.addQuestion(question);
                }

                exam.addSection(section);
            }

            examRepository.save(exam);
            seeded++;
            logger.info("Seeded exam {} with {} sections", exam.getCode(), exam.getSections().size());
        }

        logger.info("Exam seed summary -> New Exams: {}", seeded);
    }

    private void enrollStudentsForExam() throws JsonProcessingException {
        List<JsonExamEnrollmentSeed> enrollments = readJsonResource(EXAM_ENROLLMENT_SEED_FILE,
                new TypeReference<List<JsonExamEnrollmentSeed>>() {
                });

        int newEnrollments = 0;
        for (JsonExamEnrollmentSeed enrollmentSeed : enrollments) {
            School school = schoolRepository.findByCode(enrollmentSeed.getSchoolCode());
            if (school == null) {
                logger.warn("Skipping exam enrollment seed: school {} not found", enrollmentSeed.getSchoolCode());
                continue;
            }

            Exam exam = examRepository
                    .findByOrganizationIdAndCode(school.getOrganization().getId(), enrollmentSeed.getExamCode())
                    .orElse(null);
            if (exam == null) {
                logger.warn("Skipping exam enrollment seed: exam {} not found", enrollmentSeed.getExamCode());
                continue;
            }

            List<Student> students = studentRepository.findBySchoolId(school.getId());
            if (students.isEmpty()) {
                logger.warn("Skipping exam enrollment seed: no students in school {}", school.getCode());
                continue;
            }

            Map<String, Student> studentByAdmissionNo = new HashMap<>();
            for (Student student : students) {
                studentByAdmissionNo.put(student.getAdmissionNo(), student);
            }

            for (String admissionNo : enrollmentSeed.getStudentAdmissionNos()) {
                Student student = studentByAdmissionNo.get(admissionNo);
                if (student == null) {
                    logger.warn("Skipping enrollment: student {} not found in school {}", admissionNo, school.getCode());
                    continue;
                }
                if (examEnrollmentRepository.existsByExamIdAndStudentId(exam.getId(), student.getId())) {
                    continue;
                }

                ExamEnrollment enrollment = new ExamEnrollment();
                enrollment.setExam(exam);
                enrollment.setStudent(student);
                enrollment.setEnrolledAt(Instant.now());
                examEnrollmentRepository.save(enrollment);
                newEnrollments++;
            }

            logger.info("Exam enrollment seed processed -> Exam: {}, Total Enrollments: {}", enrollmentSeed.getExamCode(),
                    examEnrollmentRepository.countByExamId(exam.getId()));
        }

        logger.info("Exam enrollment seed summary -> New Enrollments: {}", newEnrollments);
    }

      private <T> T readJsonResource(String classpathFile, TypeReference<T> typeReference) throws JsonProcessingException {
        try (InputStream inputStream = new ClassPathResource(classpathFile).getInputStream()) {
          return objectMapper.readValue(inputStream, typeReference);
        } catch (IOException exception) {
          throw new JsonProcessingException("Failed to read JSON seed file: " + classpathFile, exception) {
          };
        }
      }

    private void enrollStudents() throws JsonProcessingException {
      List<JsonStudent> jsonStudents = readJsonResource(STUDENT_SEED_FILE, new TypeReference<List<JsonStudent>>() {
        });

        int[] seeded = {0};
        int[] skipped = {0};

        jsonStudents.forEach(jsonStudent -> {
            CurrentClass currentClass = jsonStudent.getCurrentClass();
            School school = schoolRepository.findByCode(jsonStudent.getSchoolCode());
                        if (school == null) {
                skipped[0]++;
				logger.warn("Skipping student seed: school {} not found", jsonStudent.getSchoolCode());
				return;
			}
            Classroom classroom = classroomRepository.findByGradeAndSectionAndSchool(
                    currentClass.getGrade(),
                    currentClass.getSection(),
                    school
            );
            if(classroom != null) {

                Student student = new Student();
                student.setFirstName(jsonStudent.getFirstName());
                student.setLastName(jsonStudent.getLastName());
                student.setGender(jsonStudent.getGender());
                student.setDateOfBirth(LocalDate.parse(jsonStudent.getDateOfBirth()));
                student.setRollNo(jsonStudent.getRollNo());
                student.setClassroom(classroom);
                student.setSchool(school);
                student.setAdmissionNo(jsonStudent.getAdmissionNo());
                student.setGuardianName(jsonStudent.getGuardianName());
                student.setGuardianPhone(jsonStudent.getGuardianPhone());
                student.setEnrolledAt(LocalDate.parse(jsonStudent.getEnrolledAt()));
                student.setAdmissionNo(jsonStudent.getAdmissionNo());

                studentRepository.save(student);
                seeded[0]++;

            } else {
                skipped[0]++;
                logger.warn("Skipping student seed: classroom {}-{} not found in school {}",
                        currentClass.getGrade(), currentClass.getSection(), school.getCode());
            }
        });

        logger.info("Student seed summary -> Requested: {}, Seeded: {}, Skipped: {}", jsonStudents.size(), seeded[0], skipped[0]);

    }

    private void schoolOrgSetup(

    ) throws JsonProcessingException {
        logger.info("LMS Module Setup start!");
      examEnrollmentRepository.deleteAll();
      examRepository.deleteAll();
      studentRepository.deleteAll();
        subjectRepository.deleteAll();
        classroomRepository.deleteAll();
        schoolRepository.deleteAll();
        schoolOrganizationRepository.deleteAll();
        List<JsonClassroom> defaultClassrooms = readJsonResource(CLASSROOM_SEED_FILE,
                new TypeReference<List<JsonClassroom>>() {
                });
        List<Trust> trusts = readJsonResource(TRUST_SEED_FILE, new TypeReference<List<Trust>>() {
        });

        trusts.forEach(trust -> {
            SchoolOrganization schoolOrganization = new SchoolOrganization();
            schoolOrganization.setName(trust.getName());
            schoolOrganization.setCode(trust.getCode());
            SchoolOrganization organization = schoolOrganizationRepository.save(schoolOrganization);

            trust.getSchools()
                    .forEach(jsonSchool -> {
                  List<JsonClassroom> schoolClassrooms = jsonSchool.getClassrooms();
                  if (schoolClassrooms == null || schoolClassrooms.isEmpty()) {
                    schoolClassrooms = defaultClassrooms;
                  }

                        School school = new School();
                        school.setCode(jsonSchool.getCode());
                        school.setName(jsonSchool.getName());
                        school.setBoards(jsonSchool.getBoard());
                        school.setOrganization(organization);
                        School save = schoolRepository.save(school);

                  schoolClassrooms
                                .forEach(jsonClassroom -> {
                                    Classroom  classroom= new Classroom();
                                    classroom.setSchool(save);
                                    classroom.setAcademicYear(jsonClassroom.getAcademicYear());
                                    classroom.setGrade(jsonClassroom.getName());
                                    classroom.setSection(jsonClassroom.getSection());

                                    Classroom classroom1 = classroomRepository.save(classroom);

                                    List<String> subjects = jsonClassroom.getSubjects();
                                    for (int i = 0; i < subjects.size(); i++) {
                                      Subject subject = new Subject();
                                      subject.setClassroom(classroom1);
                                      subject.setCode(String.format("SUB-%03d", i + 1));
                                      subject.setName(subjects.get(i));
                                      subjectRepository.save(subject);
                                    }

                                });
                    });

        });

        logger.info(
                "Seed Summary -> Organisations: {}, Schools: {}, Classrooms: {}, Subjects: {}",
                schoolOrganizationRepository.count(),
                schoolRepository.count(),
                classroomRepository.count(),
                subjectRepository.count()
        );

    }

}
