package com.liezhi.controller;

import com.liezhi.dto.request.UpdateProfileRequest;
import com.liezhi.dto.request.UpdateResumeRequest;
import com.liezhi.dto.response.ApiResponse;
import com.liezhi.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final ResumeService resumeService;
    private final FavoriteService favoriteService;
    private final ApplicationService applicationService;

    public UserController(UserService userService, ResumeService resumeService,
                          FavoriteService favoriteService, ApplicationService applicationService) {
        this.userService = userService;
        this.resumeService = resumeService;
        this.favoriteService = favoriteService;
        this.applicationService = applicationService;
    }

    private Long getUserId(Authentication auth) {
        return (Long) auth.getPrincipal();
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<?>> getProfile(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(getUserId(auth))));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> updateProfile(Authentication auth,
                                                            @RequestBody UpdateProfileRequest req) {
        userService.updateProfile(getUserId(auth), req);
        return ResponseEntity.ok(ApiResponse.success("更新成功", null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> getStats(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(userService.getStats(getUserId(auth))));
    }

    @GetMapping("/resume")
    public ResponseEntity<ApiResponse<?>> getResume(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.getResume(getUserId(auth))));
    }

    @PutMapping("/resume")
    public ResponseEntity<ApiResponse<Void>> updateResume(Authentication auth,
                                                           @RequestBody UpdateResumeRequest req) {
        resumeService.updateResume(getUserId(auth), req);
        return ResponseEntity.ok(ApiResponse.success("保存成功", null));
    }

    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<?>> getFavorites(Authentication auth,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.getFavorites(getUserId(auth), page, size)));
    }

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<?>> getApplications(Authentication auth,
                                                           @RequestParam(required = false) String status,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.getApplications(getUserId(auth), status, page, size)));
    }
}
