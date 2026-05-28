package com.liezhi.repository;

import com.liezhi.entity.WorkExperience;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkExperienceRepository extends JpaRepository<WorkExperience, Long> {
    void deleteAllByResumeId(Long resumeId);
}
