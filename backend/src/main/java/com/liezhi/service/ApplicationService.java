package com.liezhi.service;

import com.liezhi.dto.response.ApplicationResponse;
import com.liezhi.entity.*;
import com.liezhi.enums.ApplicationStatus;
import com.liezhi.enums.NotificationType;
import com.liezhi.exception.BadRequestException;
import com.liezhi.exception.ResourceNotFoundException;
import com.liezhi.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final NotificationRepository notificationRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                               JobRepository jobRepository,
                               ResumeRepository resumeRepository,
                               NotificationRepository notificationRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.resumeRepository = resumeRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Application apply(Long userId, Long jobId) {
        // Check duplicate
        if (applicationRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new BadRequestException("您已投递过该职位");
        }

        Resume resume = resumeRepository.findByUserId(userId).orElse(null);
        if (resume == null || resume.getCompleteness() == null || resume.getCompleteness() < 30) {
            throw new BadRequestException("请先完善简历（完整度需达到30%）");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("职位不存在"));

        Application app = new Application();
        app.setUser(new User() {{ setId(userId); }});
        app.setJob(job);
        app.setStatus(ApplicationStatus.PENDING);
        app = applicationRepository.save(app);

        // Create notification
        Notification notif = new Notification();
        notif.setUser(new User() {{ setId(userId); }});
        notif.setTitle("投递成功");
        notif.setMessage("您已成功投递「" + job.getTitle() + "」- " + job.getCompany());
        notif.setType(NotificationType.APPLICATION_UPDATE);
        notif.setReferenceId(app.getId());
        notificationRepository.save(notif);

        return app;
    }

    @Transactional
    public void cancel(Long userId, Long jobId) {
        Application app = applicationRepository.findByUserIdAndJobId(userId, jobId)
                .orElseThrow(() -> new BadRequestException("未找到该投递记录"));
        notificationRepository.deleteByReferenceId(app.getId());
        applicationRepository.delete(app);
    }

    public List<ApplicationResponse> getApplications(Long userId, String status, int page, int size) {
        ApplicationStatus as = null;
        if (status != null && !status.equals("all") && !status.isEmpty()) {
            try {
                as = ApplicationStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Page<Application> appPage = applicationRepository.findByUserIdAndStatus(userId, as,
                PageRequest.of(page, size));

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        return appPage.getContent().stream().map(app -> {
            ApplicationResponse resp = new ApplicationResponse();
            resp.setId(app.getId());
            Job job = app.getJob();
            resp.setJobId(job.getId());
            resp.setTitle(job.getTitle());
            resp.setCompany(job.getCompany());
            resp.setInitials(job.getInitials());
            resp.setLogoColor(job.getLogoColor());
            resp.setSalary(formatSalary(job));
            resp.setStatus(app.getStatus().name().toLowerCase());
            resp.setStatusText(app.getStatus().getLabel());
            resp.setAppliedAt(app.getAppliedAt() != null ? app.getAppliedAt().format(fmt) : "");
            if (app.getInterviewAt() != null) {
                resp.setInterviewAt(app.getInterviewAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            }
            return resp;
        }).collect(Collectors.toList());
    }

    private String formatSalary(Job job) {
        if (job.getSalaryMin() != null && job.getSalaryMax() != null) {
            return job.getSalaryMin() / 1000 + "–" + job.getSalaryMax() / 1000 + "K";
        }
        return "薪资面议";
    }
}
