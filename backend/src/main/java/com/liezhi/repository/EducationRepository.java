package com.liezhi.repository;

import com.liezhi.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EducationRepository extends JpaRepository<Education, Long> {
    void deleteAllByResumeId(Long resumeId);
}
