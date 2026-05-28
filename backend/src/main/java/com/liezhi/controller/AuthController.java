package com.liezhi.controller;

import com.liezhi.dto.request.*;
import com.liezhi.dto.response.ApiResponse;
import com.liezhi.service.AuthService;
import com.liezhi.service.SmsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SmsService smsService;

    public AuthController(AuthService authService, SmsService smsService) {
        this.authService = authService;
        this.smsService = smsService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(req.getPhone(), req.getPassword())));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@Valid @RequestBody RegisterRequest req) {
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "两次密码不一致"));
        }
        return ResponseEntity.ok(ApiResponse.success("注册成功",
                authService.register(req.getName(), req.getPhone(), req.getSmsCode(),
                        req.getPassword(), req.getExpectedPosition(), req.getExpectedCity(),
                        req.getExpectedSalary())));
    }

    @PostMapping("/send-sms")
    public ResponseEntity<ApiResponse<Void>> sendSms(@Valid @RequestBody SendSmsRequest req) {
        smsService.sendSms(req.getPhone());
        return ResponseEntity.ok(ApiResponse.success("验证码已发送", null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<?>> refresh(@Valid @RequestBody RefreshTokenRequest req) {
        return ResponseEntity.ok(ApiResponse.success(authService.refreshToken(req.getRefreshToken())));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.getPhone(), req.getSmsCode(), req.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("密码重置成功", null));
    }

    @PostMapping("/wechat-login")
    public ResponseEntity<ApiResponse<?>> wechatLogin(@RequestBody SocialLoginRequest req) {
        return ResponseEntity.ok(ApiResponse.success(authService.socialLogin("wechat", req.getCode())));
    }

    @PostMapping("/qq-login")
    public ResponseEntity<ApiResponse<?>> qqLogin(@RequestBody SocialLoginRequest req) {
        return ResponseEntity.ok(ApiResponse.success(authService.socialLogin("qq", req.getCode())));
    }

    @PostMapping("/apple-login")
    public ResponseEntity<ApiResponse<?>> appleLogin(@RequestBody SocialLoginRequest req) {
        return ResponseEntity.ok(ApiResponse.success(authService.socialLogin("apple", req.getCode())));
    }
}
