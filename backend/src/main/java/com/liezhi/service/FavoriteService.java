package com.liezhi.service;

import com.liezhi.dto.response.FavoriteStatusResponse;
import com.liezhi.dto.response.JobBrief;
import com.liezhi.dto.response.JobListResponse;
import com.liezhi.entity.*;
import com.liezhi.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final JobRepository jobRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, JobRepository jobRepository) {
        this.favoriteRepository = favoriteRepository;
        this.jobRepository = jobRepository;
    }

    @Transactional
    public FavoriteStatusResponse toggle(Long userId, Long jobId) {
        return favoriteRepository.findByUserIdAndJobId(userId, jobId)
                .map(fav -> {
                    favoriteRepository.delete(fav);
                    return new FavoriteStatusResponse(false);
                })
                .orElseGet(() -> {
                    Job job = jobRepository.findById(jobId)
                            .orElseThrow(() -> new com.liezhi.exception.ResourceNotFoundException("职位不存在"));
                    Favorite fav = new Favorite();
                    fav.setUser(new User() {{ setId(userId); }});
                    fav.setJob(job);
                    favoriteRepository.save(fav);
                    return new FavoriteStatusResponse(true);
                });
    }

    public JobListResponse getFavorites(Long userId, int page, int size) {
        Page<Favorite> favPage = favoriteRepository.findByUserId(userId, PageRequest.of(page, size));

        List<JobBrief> list = favPage.getContent().stream().map(fav -> {
            Job job = fav.getJob();
            JobBrief brief = new JobBrief();
            brief.setId(job.getId());
            brief.setTitle(job.getTitle());
            brief.setCompany(job.getCompany());
            brief.setInitials(job.getInitials());
            brief.setLogoColor(job.getLogoColor());
            brief.setLocation(job.getLocation());
            brief.setSalary(formatSalary(job));
            brief.setExperience(job.getExperience());
            brief.setEducation(job.getEducation());
            brief.setHeadcount(job.getHeadcount() != null ? job.getHeadcount() : 0);
            brief.setTags(job.getTags().stream().map(JobTag::getTag).collect(Collectors.toList()));
            brief.setIsNew(job.getIsNew() != null && job.getIsNew());
            brief.setIsHot(job.getIsHot() != null && job.getIsHot());
            brief.setPostedAt(formatPostedAt(job.getPostedAt()));
            brief.setIsFavorited(true);
            return brief;
        }).collect(Collectors.toList());

        JobListResponse resp = new JobListResponse();
        resp.setTotal(favPage.getTotalElements());
        resp.setPage(favPage.getNumber());
        resp.setSize(favPage.getSize());
        resp.setList(list);
        return resp;
    }

    private String formatSalary(Job job) {
        if (job.getSalaryMin() != null && job.getSalaryMax() != null) {
            String base = job.getSalaryMin() / 1000 + "–" + job.getSalaryMax() / 1000 + "K";
            if (job.getSalaryMonths() != null && job.getSalaryMonths() > 12) {
                base += " · " + job.getSalaryMonths() + "薪";
            }
            return base;
        }
        return "薪资面议";
    }

    private String formatPostedAt(LocalDateTime postedAt) {
        if (postedAt == null) return "";
        long minutes = Duration.between(postedAt, LocalDateTime.now()).toMinutes();
        if (minutes < 60) return minutes < 1 ? "刚刚" : minutes + "分钟前";
        long hours = minutes / 60;
        if (hours < 24) return hours + "小时前";
        long days = hours / 24;
        if (days < 30) return days + "天前";
        return (days / 30) + "个月前";
    }
}
