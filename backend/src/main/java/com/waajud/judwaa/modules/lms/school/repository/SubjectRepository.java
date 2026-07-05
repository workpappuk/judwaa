package com.waajud.judwaa.modules.lms.school.repository;

import com.waajud.judwaa.modules.lms.school.entity.Subject;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, UUID> {
}
