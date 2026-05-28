package com.liezhi.service;

import com.liezhi.dto.request.UpdateResumeRequest;
import com.liezhi.dto.response.ResumeResponse;
import com.liezhi.entity.*;
import com.liezhi.exception.ResourceNotFoundException;
import com.liezhi.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final EducationRepository educationRepository;
    private final ResumeSkillRepository resumeSkillRepository;

    public ResumeService(ResumeRepository resumeRepository, UserRepository userRepository,
                         WorkExperienceRepository workExperienceRepository,
                         EducationRepository educationRepository,
                         ResumeSkillRepository resumeSkillRepository) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.workExperienceRepository = workExperienceRepository;
        this.educationRepository = educationRepository;
        this.resumeSkillRepository = resumeSkillRepository;
    }

    public ResumeResponse getResume(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("简历不存在"));

        ResumeResponse resp = new ResumeResponse();
        resp.setName(user.getName());
        resp.setTitle(user.getTitle());
        resp.setGender(user.getGender());
        resp.setAge(user.getAge());
        resp.setExperience(user.getExperienceYears() != null ? user.getExperienceYears() + "年经验" : null);
        resp.setEducation(user.getEducation());
        resp.setSchool(resume.getSchool());
        resp.setMajor(resume.getMajor());
        resp.setSchoolPeriod(resume.getSchoolPeriod());
        resp.setPhone(resume.getPhone() != null ? resume.getPhone() : user.getPhone());
        resp.setEmail(resume.getEmail() != null ? resume.getEmail() : user.getEmail());
        resp.setLocation(resume.getLocation() != null ? resume.getLocation() : user.getLocation());
        resp.setWorkMode(resume.getWorkMode());
        resp.setCompleteness(resume.getCompleteness() != null ? resume.getCompleteness() : 0);

        resp.setWorkExperiences(resume.getWorkExperiences().stream().map(we -> {
            ResumeResponse.WorkExp item = new ResumeResponse.WorkExp();
            item.setId(we.getId());
            item.setCompany(we.getCompany());
            item.setTitle(we.getTitle());
            item.setPeriod(we.getPeriod());
            item.setDescription(we.getDescription());
            return item;
        }).collect(Collectors.toList()));

        resp.setEducations(resume.getEducations().stream().map(ed -> {
            ResumeResponse.EducationItem item = new ResumeResponse.EducationItem();
            item.setId(ed.getId());
            item.setSchool(ed.getSchool());
            item.setDegree(ed.getDegree());
            item.setMajor(ed.getMajor());
            item.setPeriod(ed.getPeriod());
            return item;
        }).collect(Collectors.toList()));

        resp.setSkills(resume.getSkills().stream().map(ResumeSkill::getSkillName).collect(Collectors.toList()));

        return resp;
    }

    @Transactional
    public void updateResume(Long userId, UpdateResumeRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("简历不存在"));

        if (req.getTitle() != null) resume.setTitle(req.getTitle());
        if (req.getPhone() != null) resume.setPhone(req.getPhone());
        if (req.getEmail() != null) resume.setEmail(req.getEmail());
        if (req.getLocation() != null) resume.setLocation(req.getLocation());
        if (req.getWorkMode() != null) resume.setWorkMode(req.getWorkMode());
        if (req.getSchool() != null) resume.setSchool(req.getSchool());
        if (req.getMajor() != null) resume.setMajor(req.getMajor());
        if (req.getSchoolPeriod() != null) resume.setSchoolPeriod(req.getSchoolPeriod());

        // Sync title with user
        if (req.getTitle() != null) {
            user.setTitle(req.getTitle());
            userRepository.save(user);
        }

        // Replace work experiences
        if (req.getWorkExperiences() != null) {
            resume.getWorkExperiences().clear();
            for (int i = 0; i < req.getWorkExperiences().size(); i++) {
                var item = req.getWorkExperiences().get(i);
                WorkExperience we = new WorkExperience();
                we.setResume(resume);
                we.setCompany(item.getCompany());
                we.setTitle(item.getTitle());
                we.setPeriod(item.getPeriod());
                we.setDescription(item.getDescription());
                we.setSortOrder(i);
                resume.getWorkExperiences().add(we);
            }
        }

        // Replace educations
        if (req.getEducations() != null) {
            resume.getEducations().clear();
            for (int i = 0; i < req.getEducations().size(); i++) {
                var item = req.getEducations().get(i);
                Education ed = new Education();
                ed.setResume(resume);
                ed.setSchool(item.getSchool());
                ed.setDegree(item.getDegree());
                ed.setMajor(item.getMajor());
                ed.setPeriod(item.getPeriod());
                ed.setSortOrder(i);
                resume.getEducations().add(ed);
            }
        }

        // Replace skills
        if (req.getSkills() != null) {
            resume.getSkills().clear();
            for (int i = 0; i < req.getSkills().size(); i++) {
                ResumeSkill skill = new ResumeSkill(req.getSkills().get(i), i);
                skill.setResume(resume);
                resume.getSkills().add(skill);
            }
        }

        // Calculate completeness
        int score = 0;
        if (resume.getTitle() != null) score += 10;
        if (resume.getSchool() != null) score += 15;
        if (!resume.getWorkExperiences().isEmpty()) score += 30;
        if (!resume.getEducations().isEmpty()) score += 15;
        if (!resume.getSkills().isEmpty()) score += 20;
        if (resume.getPhone() != null) score += 5;
        if (resume.getEmail() != null) score += 5;
        resume.setCompleteness(score);

        resumeRepository.save(resume);
    }
}
