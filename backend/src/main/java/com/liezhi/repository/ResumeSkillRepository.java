package com.liezhi.repository;

import com.liezhi.entity.ResumeSkill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeSkillRepository extends JpaRepository<ResumeSkill, Long> {
    void deleteAllByResumeId(Long resumeId);
}
