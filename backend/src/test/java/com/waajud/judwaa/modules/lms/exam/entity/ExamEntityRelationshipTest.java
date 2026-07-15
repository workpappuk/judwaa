package com.waajud.judwaa.modules.lms.exam.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import org.junit.jupiter.api.Test;

class ExamEntityRelationshipTest {

    @Test
    void exam_setSections_nullClearsExistingSections() {
        Exam exam = new Exam();
        ExamSection section = new ExamSection();
        exam.addSection(section);

        exam.setSections(null);

        assertEquals(0, exam.getSections().size());
    }

    @Test
    void examSection_setQuestions_nullClearsExistingQuestions() {
        ExamSection section = new ExamSection();
        Question question = new Question();
        section.addQuestion(question);

        section.setQuestions(null);

        assertEquals(0, section.getQuestions().size());
    }

    @Test
    void question_setOptions_nullClearsExistingOptions() {
        Question question = new Question();
        QuestionOption option = new QuestionOption();
        question.addOption(option);

        question.setOptions(null);

        assertEquals(0, question.getOptions().size());
    }

    @Test
    void addMethods_setBackReferences() {
        Exam exam = new Exam();
        ExamSection section = new ExamSection();
        Question question = new Question();
        QuestionOption option = new QuestionOption();

        exam.setSections(List.of(section));
        section.setQuestions(List.of(question));
        question.setOptions(List.of(option));

        assertEquals(exam, section.getExam());
        assertEquals(section, question.getSection());
        assertEquals(question, option.getQuestion());
    }
}
