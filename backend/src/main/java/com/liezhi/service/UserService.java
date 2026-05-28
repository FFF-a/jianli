package com.liezhi.service;

import com.liezhi.dto.request.UpdateProfileRequest;
import com.liezhi.dto.response.UserProfileResponse;
import com.liezhi.dto.response.UserStatsResponse;
import com.liezhi.entity.*;
import com.liezhi.enums.ApplicationStatus;
import com.liezhi.exception.ResourceNotFoundException;
import com.liezhi.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final ApplicationRepository applicationRepository;
    private final FavoriteRepository favoriteRepository;
    private final UserJobPreferenceRepository preferenceRepository;

    public UserService(UserRepository userRepository, ResumeRepository resumeRepository,
                       ApplicationRepository applicationRepository,
                       FavoriteRepository favoriteRepository,
                       UserJobPreferenceRepository preferenceRepository) {
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.applicationRepository = applicationRepository;
        this.favoriteRepository = favoriteRepository;
        this.preferenceRepository = preferenceRepository;
    }

    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        Resume resume = resumeRepository.findByUserId(userId).orElse(null);
        UserJobPreference pref = preferenceRepository.findByUserId(userId).orElse(null);

        UserProfileResponse resp = new UserProfileResponse();
        resp.setId(user.getId());
        resp.setName(user.getName());
        resp.setAvatarColor(user.getAvatarColor());
        resp.setPhone(user.getPhone().replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2"));
        resp.setEmail(user.getEmail());
        resp.setGender(user.getGender());
        resp.setAge(user.getAge());
        resp.setTitle(user.getTitle());
        resp.setExperience(user.getExperienceYears() != null ? user.getExperienceYears() + "年经验" : null);
        resp.setEducation(user.getEducation());
        resp.setLocation(user.getLocation());
        resp.setStatus(user.getIsJobSeeking() != null && user.getIsJobSeeking() ? "求职中" : "在职看看机会");
        resp.setResumeCompletion(resume != null ? resume.getCompleteness() : 0);

        if (pref != null) {
            resp.setDesiredPosition(pref.getExpectedPosition());
            resp.setDesiredCity(pref.getExpectedCity());
            resp.setDesiredSalary(pref.getExpectedSalary());
        }

        return resp;
    }

    @Transactional
    public void updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));

        if (req.getName() != null) user.setName(req.getName());
        if (req.getTitle() != null) user.setTitle(req.getTitle());
        if (req.getLocation() != null) user.setLocation(req.getLocation());
        if (req.getEmail() != null) user.setEmail(req.getEmail());
        if (req.getGender() != null) user.setGender(req.getGender());
        if (req.getAge() != null) user.setAge(req.getAge());
        if (req.getEducation() != null) user.setEducation(req.getEducation());
        if (req.getStatus() != null) user.setIsJobSeeking("求职中".equals(req.getStatus()));

        userRepository.save(user);

        if (req.getDesiredPosition() != null || req.getDesiredCity() != null || req.getDesiredSalary() != null) {
            UserJobPreference pref = preferenceRepository.findByUserId(userId)
                    .orElseGet(() -> {
                        UserJobPreference p = new UserJobPreference();
                        p.setUser(user);
                        return p;
                    });
            if (req.getDesiredPosition() != null) pref.setExpectedPosition(req.getDesiredPosition());
            if (req.getDesiredCity() != null) pref.setExpectedCity(req.getDesiredCity());
            if (req.getDesiredSalary() != null) pref.setExpectedSalary(req.getDesiredSalary());
            preferenceRepository.save(pref);
        }
    }

    public UserStatsResponse getStats(Long userId) {
        UserStatsResponse stats = new UserStatsResponse();
        stats.setAppliedCount(applicationRepository.countByUserId(userId));
        stats.setPendingReplyCount(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.PENDING));
        stats.setInterviewCount(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEW));
        stats.setOfferCount(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OFFER));
        stats.setFavoriteCount(favoriteRepository.countByUserId(userId));
        return stats;
    }
}
