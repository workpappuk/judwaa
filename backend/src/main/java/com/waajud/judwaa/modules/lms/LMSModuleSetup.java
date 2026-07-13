package com.waajud.judwaa.modules.lms;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.waajud.judwaa.modules.lms.school.entity.Classroom;
import com.waajud.judwaa.modules.lms.school.entity.School;
import com.waajud.judwaa.modules.lms.school.entity.SchoolOrganization;
import com.waajud.judwaa.modules.lms.school.entity.Subject;
import com.waajud.judwaa.modules.lms.school.repository.ClassroomRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolOrganizationRepository;
import com.waajud.judwaa.modules.lms.school.repository.SchoolRepository;
import com.waajud.judwaa.modules.lms.school.repository.SubjectRepository;
import com.waajud.judwaa.modules.lms.student.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

@Configuration
public class LMSModuleSetup {
    private static final Logger logger = LoggerFactory.getLogger(LMSModuleSetup.class);

    private final ObjectMapper objectMapper;
    private final SchoolOrganizationRepository schoolOrganizationRepository;
    private final  SchoolRepository schoolRepository;
    private final  ClassroomRepository classroomRepository;
    private final  SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;

    public LMSModuleSetup(ObjectMapper objectMapper, SchoolOrganizationRepository schoolOrganizationRepository, SchoolRepository schoolRepository, ClassroomRepository classroomRepository, SubjectRepository subjectRepository, StudentRepository studentRepository) {
        this.objectMapper = objectMapper;
        this.schoolOrganizationRepository = schoolOrganizationRepository;
        this.schoolRepository = schoolRepository;
        this.classroomRepository = classroomRepository;
        this.subjectRepository = subjectRepository;
        this.studentRepository = studentRepository;
    }

    @Bean
    public CommandLineRunner seedLMS(

    ) {
        return args -> {
          schoolOrgSetup();
          enrollStudents();
        };
    }

    private void enrollStudents() {
    }

    private void schoolOrgSetup(

    ) throws JsonProcessingException {
        logger.info("LMS Module Setup start!");
        subjectRepository.deleteAll();
        classroomRepository.deleteAll();
        schoolRepository.deleteAll();
        schoolOrganizationRepository.deleteAll();
        String classroomJSON = """
  {
    "name": "LKG",
    "section": "A",
    "academicYear": "2026-2027",
    "subjects": [
      "English",
      "Mathematics",
      "Rhymes",
      "Drawing"
    ]
  },
  {
    "name": "UKG",
    "section": "A",
    "academicYear": "2026-2027",
    "subjects": [
      "English",
      "Mathematics",
      "EVS",
      "Drawing"
    ]
  },
  {
    "name": "Class 1",
    "section": "A",
    "academicYear": "2026-2027",
    "subjects": [
      "English",
      "Mathematics",
      "EVS",
      "Hindi"
    ]
  },
  {
    "name": "Class 2",
    "section": "A",
    "academicYear": "2026-2027",
    "subjects": [
      "English",
      "Mathematics",
      "EVS",
      "Hindi"
    ]
  },
  {
    "name": "Class 3",
    "section": "A",
    "academicYear": "2026-2027",
    "subjects": [
      "English",
      "Mathematics",
      "Science",
      "Social Studies",
      "Hindi"
    ]
  },
  {
    "name": "Class 4",
    "section": "A",
    "academicYear": "2026-2027",
    "subjects": [
      "English",
      "Mathematics",
      "Science",
      "Social Studies",
      "Hindi"
    ]
  },
  {
    "name": "Class 5",
    "section": "A",
    "academicYear": "2026-2027",
    "subjects": [
      "English",
      "Mathematics",
      "Science",
      "Social Studies",
      "Computer"
    ]
  },
  {
    "name": "Class 6",
    "section": "A",
    "academicYear": "2026-2027",
    "subjects": [
      "English",
      "Mathematics",
      "Science",
      "Social Science",
      "Computer",
      "Hindi"
    ]
  },
  {
    "name": "Class 7",
    "section": "A",
    "academicYear": "2026-2027",
    "subjects": [
      "English",
      "Mathematics",
      "Science",
      "Social Science",
      "Computer",
      "Hindi"
    ]
  },
  {
    "name": "Class 8",
    "section": "A",
    "academicYear": "2026-2027",
    "subjects": [
      "English",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "History",
      "Geography",
      "Computer"
    ]
  },
  {
    "name": "Class 9",
    "section": "A",
    "academicYear": "2026-2027",
    "subjects": [
      "English",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "History",
      "Geography",
      "Computer"
    ]
  },
  {
    "name": "Class 10",
    "section": "A",
    "academicYear": "2026-2027",
    "subjects": [
      "English",
      "Mathematics",
      "Science",
      "Social Science",
      "Computer"
    ]
  },
  {
    "name": "Class 11",
    "section": "A",
    "academicYear": "2026-2027",
    "subjects": [
      "English",
      "Physics",
      "Chemistry",
      "Mathematics",
      "Computer Science"
    ]
  },
  {
    "name": "Class 12",
    "section": "A",
    "academicYear": "2026-2027",
    "subjects": [
      "English",
      "Physics",
      "Chemistry",
      "Mathematics",
      "Computer Science"
    ]
  }
]
""";
        String json = """
                    [
                       {
                         "name": "St. John's Educational Trust",
                         "code": "T001",
                         "schools": [
                           {
                             "name": "St. John's Senior Secondary School, Chennai",
                             "code": "S001",
                             "board": ["CBSE"],
                             "classrooms": %s
                           },
                           {
                             "name": "St. John's English School & Junior College, Chennai",
                             "code": "S002",
                             "board": ["CBSE"],
                             "classrooms": %s
                           },
                           {
                             "name": "St. John's Matriculation Higher Secondary School, Alwarthirunagar",
                             "code": "S003",
                             "board": ["State Board"],
                             "classrooms": %s
                           },
                           {
                             "name": "St. John's International Residential School, Chennai",
                             "code": "S004",
                             "board": ["CBSE"],
                             "classrooms": %s
                           }
                         ]
                       },
                       {
                         "name": "Delhi Public School Society",
                         "code": "T002",
                         "schools": [
                           {
                             "name": "Delhi Public School, RK Puram",
                             "code": "S005",
                             "board": ["CBSE"],
                             "classrooms": %s
                           },
                           {
                             "name": "Delhi Public School, Vasant Kunj",
                             "code": "S006",
                             "board": ["CBSE"],
                             "classrooms": %s
                           },
                           {
                             "name": "Delhi Public School, Bangalore East",
                             "code": "S007",
                             "board": ["CBSE"],
                             "classrooms": %s
                           }
                         ]
                       },
                       {
                         "name": "Ryan International Group of Institutions",
                         "code": "T003",
                         "schools": [
                           {
                             "name": "Ryan International School, Vasant Kunj",
                             "code": "S008",
                             "board": ["CBSE"],
                             "classrooms": %s
                           },
                           {
                             "name": "Ryan International School, Noida",
                             "code": "S009",
                             "board": ["CBSE", "ICSE"],
                             "classrooms": %s
                           },
                           {
                             "name": "Ryan International School, HSR Layout",
                             "code": "S010",
                             "board": ["ICSE"],
                             "classrooms": %s
                           }
                         ]
                       },
                       {
                         "name": "National Public School Trust",
                         "code": "T004",
                         "schools": [
                           {
                             "name": "National Public School, Rajajinagar",
                             "code": "S011",
                             "board": ["CBSE"],
                             "classrooms": %s
                           },
                           {
                             "name": "National Public School, Indiranagar",
                             "code": "S012",
                             "board": ["CBSE"],
                             "classrooms": %s
                           },
                           {
                             "name": "National Public School, Koramangala",
                             "code": "S013",
                             "board": ["CBSE"],
                             "classrooms": %s
                           }
                         ]
                       },
                       {
                         "name": "DAV College Managing Committee",
                         "code": "T005",
                         "schools": [
                           {
                             "name": "DAV Public School, Chandrasekharpur",
                             "code": "S014",
                             "board": ["CBSE"],
                             "classrooms": %s
                           },
                           {
                             "name": "DAV Public School, Nerul",
                             "code": "S015",
                             "board": ["CBSE"],
                             "classrooms": %s
                           },
                           {
                             "name": "DAV Public School, Aundh",
                             "code": "S016",
                             "board": ["CBSE"],
                             "classrooms": %s
                           }
                         ]
                       }
                     ]
                    """.formatted( classroomJSON, classroomJSON, classroomJSON, classroomJSON,
                classroomJSON, classroomJSON, classroomJSON,
                classroomJSON, classroomJSON, classroomJSON,
                classroomJSON, classroomJSON, classroomJSON,
                classroomJSON, classroomJSON, classroomJSON);

        List<Trust> trusts = objectMapper.readValue(json, new TypeReference<List<Trust>>() {
        });

        trusts.forEach(trust -> {
            SchoolOrganization schoolOrganization = new SchoolOrganization();
            schoolOrganization.setName(trust.getName());
            schoolOrganization.setCode(trust.getCode());
            SchoolOrganization organization = schoolOrganizationRepository.save(schoolOrganization);

            trust.getSchools()
                    .forEach(jsonSchool -> {
                        School school = new School();
                        school.setCode(jsonSchool.getCode());
                        school.setName(jsonSchool.getName());
                        school.setBoards(jsonSchool.getBoard());
                        school.setOrganization(organization);
                        School save = schoolRepository.save(school);

                        jsonSchool.getClassrooms()
                                .forEach(jsonClassroom -> {
                                    Classroom  classroom= new Classroom();
                                    classroom.setSchool(save);
                                    classroom.setAcademicYear(jsonClassroom.getAcademicYear());
                                    classroom.setGrade(jsonClassroom.getName());
                                    classroom.setSection(jsonClassroom.getSection());

                                    Classroom classroom1 = classroomRepository.save(classroom);

                                    jsonClassroom
                                            .getSubjects()
                                            .forEach(jsonSubjects -> {
                                                Subject subject = new Subject();
                                                subject.setClassroom(classroom1);
                                                subject.setCode(String.valueOf(ThreadLocalRandom.current().nextInt(10000, 100000)));
                                                subject.setName(jsonSubjects);
                                                subjectRepository.save(subject);
                                            });

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


    public static class JsonSchool {
        private String name;
        private String code;
        private Set<String> board;
        private List<JsonClassroom> classrooms;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public Set<String> getBoard() {
            return board;
        }

        public void setBoard(Set<String> board) {
            this.board = board;
        }

        public List<JsonClassroom> getClassrooms() {
            return classrooms;
        }

        public void setClassrooms(List<JsonClassroom> classrooms) {
            this.classrooms = classrooms;
        }
    }

    public static class Trust {
        private String name;
        private String code;
        private List<JsonSchool> schools;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public List<JsonSchool> getSchools() {
            return schools;
        }

        public void setSchools(List<JsonSchool> schools) {
            this.schools = schools;
        }


    }

    public static class JsonClassroom {
        private String name;
        private List<String> subjects;
        private String section;
        private String academicYear;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public List<String> getSubjects() {
            return subjects;
        }

        public void setSubjects(List<String> subjects) {
            this.subjects = subjects;
        }

        public String getSection() {
            return section;
        }

        public void setSection(String section) {
            this.section = section;
        }

        public String getAcademicYear() {
            return academicYear;
        }

        public void setAcademicYear(String academicYear) {
            this.academicYear = academicYear;
        }
    }


}
