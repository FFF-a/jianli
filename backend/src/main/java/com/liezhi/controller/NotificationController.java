package com.liezhi.controller;

import com.liezhi.dto.response.ApiResponse;
import com.liezhi.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<?>> getUnreadCount(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getUnreadCount((Long) auth.getPrincipal())));
    }
}
