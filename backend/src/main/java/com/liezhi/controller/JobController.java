package com.liezhi.controller;

import com.liezhi.dto.response.ApiResponse;
import com.liezhi.dto.response.FavoriteStatusResponse;
import com.liezhi.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final FavoriteService favoriteService;
    private final ApplicationService applicationService;

    public JobController(JobService jobService, FavoriteService favoriteService,
                         ApplicationService applicationService) {
        this.jobService = jobService;
        this.favoriteService = favoriteService;
        this.applicationService = applicationService;
    }

    private Long getUserIdOrNull(Authentication auth) {
        return auth != null ? (Long) auth.getPrincipal() : null;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getJobs(Authentication auth,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                jobService.getJobs(page, size, getUserIdOrNull(auth))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getJobDetail(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
                jobService.getJobDetail(id, getUserIdOrNull(auth))));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(@RequestParam(required = false) String keyword,
                                                  @RequestParam(required = false) String city,
                                                  @RequestParam(required = false) String type,
                                                  @RequestParam(required = false) String edu,
                                                  @RequestParam(required = false) String exp,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "20") int size,
                                                  Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
                jobService.search(keyword, city, type, edu, exp, page, size, getUserIdOrNull(auth))));
    }

    @GetMapping("/hot-searches")
    public ResponseEntity<ApiResponse<?>> getHotSearches() {
        return ResponseEntity.ok(ApiResponse.success(jobService.getHotSearches()));
    }

    @GetMapping("/recent-searches")
    public ResponseEntity<ApiResponse<?>> getRecentSearches(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
                jobService.getRecentSearches(getUserIdOrNull(auth))));
    }

    @GetMapping("/filter-options")
    public ResponseEntity<ApiResponse<?>> getFilterOptions() {
        return ResponseEntity.ok(ApiResponse.success(jobService.getFilterOptions()));
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<FavoriteStatusResponse>> toggleFavorite(
            @PathVariable Long id, Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "请先登录"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                favoriteService.toggle((Long) auth.getPrincipal(), id)));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<ApiResponse<Void>> apply(@PathVariable Long id, Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "请先登录"));
        }
        applicationService.apply((Long) auth.getPrincipal(), id);
        return ResponseEntity.ok(ApiResponse.success("投递成功", null));
    }

    @DeleteMapping("/{id}/apply")
    public ResponseEntity<ApiResponse<Void>> cancelApply(@PathVariable Long id, Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "请先登录"));
        }
        applicationService.cancel((Long) auth.getPrincipal(), id);
        return ResponseEntity.ok(ApiResponse.success("已取消投递", null));
    }
}
