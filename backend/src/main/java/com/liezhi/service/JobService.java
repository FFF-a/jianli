package com.liezhi.service;

import com.liezhi.dto.response.*;
import com.liezhi.entity.*;
import com.liezhi.exception.ResourceNotFoundException;
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
public class JobService {

    private final JobRepository jobRepository;
    private final FavoriteRepository favoriteRepository;
    private final ApplicationRepository applicationRepository;
    private final HotSearchRepository hotSearchRepository;
    private final SearchHistoryRepository searchHistoryRepository;

    public JobService(JobRepository jobRepository, FavoriteRepository favoriteRepository,
                      ApplicationRepository applicationRepository,
                      HotSearchRepository hotSearchRepository,
                      SearchHistoryRepository searchHistoryRepository) {
        this.jobRepository = jobRepository;
        this.favoriteRepository = favoriteRepository;
        this.applicationRepository = applicationRepository;
        this.hotSearchRepository = hotSearchRepository;
        this.searchHistoryRepository = searchHistoryRepository;
    }

    public JobListResponse getJobs(int page, int size, Long userId) {
        Page<Job> jobPage = jobRepository.findByIsActiveTrueOrderByPostedAtDesc(PageRequest.of(page, size));
        return mapToJobListResponse(jobPage, userId);
    }

    public JobDetailResponse getJobDetail(Long jobId, Long userId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("职位不存在"));

        JobDetailResponse resp = new JobDetailResponse();
        resp.setId(job.getId());
        resp.setTitle(job.getTitle());
        resp.setCompany(job.getCompany());
        resp.setInitials(job.getInitials());
        resp.setLogoColor(job.getLogoColor());
        resp.setLocation(job.getLocation());
        resp.setSalary(formatSalary(job));
        resp.setExperience(job.getExperience());
        resp.setEducation(job.getEducation());
        resp.setHeadcount(job.getHeadcount() != null ? job.getHeadcount() : 0);
        resp.setTags(job.getTags().stream().map(JobTag::getTag).collect(Collectors.toList()));
        resp.setIsNew(job.getIsNew() != null && job.getIsNew());
        resp.setIsHot(job.getIsHot() != null && job.getIsHot());
        resp.setPostedAt(formatPostedAt(job.getPostedAt()));
        resp.setDesc(job.getDescription());
        resp.setRequirements(job.getRequirements().stream().map(JobRequirement::getContent).collect(Collectors.toList()));
        resp.setWelfare(job.getWelfares().stream().map(JobWelfare::getName).collect(Collectors.toList()));
        resp.setCompanySize(job.getCompanySize());
        resp.setCompanyType(job.getCompanyType());
        resp.setCompanyStage(job.getCompanyStage());
        resp.setIndustry(job.getIndustry());

        if (userId != null) {
            resp.setIsFavorited(favoriteRepository.existsByUserIdAndJobId(userId, jobId));
            resp.setIsApplied(applicationRepository.existsByUserIdAndJobId(userId, jobId));
        }

        return resp;
    }

    @Transactional
    public JobListResponse search(String keyword, String city, String jobType, String education,
                                   String experience, int page, int size, Long userId) {
        // Save search history
        if (userId != null && keyword != null && !keyword.isBlank()) {
            SearchHistory sh = new SearchHistory();
            sh.setUser(new User() {{ setId(userId); }});
            sh.setQuery(keyword);
            searchHistoryRepository.save(sh);

            // Increment hot search count
            hotSearchRepository.findByKeyword(keyword).ifPresentOrElse(
                hs -> { hs.setSearchCount(hs.getSearchCount() + 1); hotSearchRepository.save(hs); },
                () -> { HotSearch hs = new HotSearch(); hs.setKeyword(keyword); hs.setSearchCount(1); hotSearchRepository.save(hs); }
            );
        }

        Page<Job> jobPage = jobRepository.search(keyword, city, jobType, education, experience,
                PageRequest.of(page, size));
        return mapToJobListResponse(jobPage, userId);
    }

    public List<String> getHotSearches() {
        return hotSearchRepository.findTop10ByOrderBySearchCountDesc()
                .stream().map(HotSearch::getKeyword).collect(Collectors.toList());
    }

    public List<String> getRecentSearches(Long userId) {
        if (userId == null) return List.of();
        return searchHistoryRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(SearchHistory::getQuery).distinct().collect(Collectors.toList());
    }

    public FilterOptionsResponse getFilterOptions() {
        FilterOptionsResponse resp = new FilterOptionsResponse();
        resp.setCities(List.of("北京", "上海", "杭州", "深圳", "广州", "成都", "武汉"));
        resp.setSalaries(List.of("10K以下", "10–20K", "20–40K", "40–60K", "60K以上"));
        resp.setExperiences(List.of("应届生", "1–3年", "3–5年", "5年以上"));
        resp.setEducations(List.of("大专", "本科", "硕士", "博士"));
        resp.setTypes(List.of("全职", "兼职", "实习", "远程"));
        return resp;
    }

    // ==== Helper methods ====

    private JobListResponse mapToJobListResponse(Page<Job> jobPage, Long userId) {
        JobListResponse resp = new JobListResponse();
        resp.setTotal(jobPage.getTotalElements());
        resp.setPage(jobPage.getNumber());
        resp.setSize(jobPage.getSize());

        List<JobBrief> list = jobPage.getContent().stream().map(job -> {
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

            if (userId != null) {
                brief.setIsFavorited(favoriteRepository.existsByUserIdAndJobId(userId, job.getId()));
            }

            return brief;
        }).collect(Collectors.toList());

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
