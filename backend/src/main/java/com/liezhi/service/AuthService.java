package com.liezhi.service;

import com.liezhi.config.JwtProperties;
import com.liezhi.dto.response.LoginResponse;
import com.liezhi.dto.response.TokenRefreshResponse;
import com.liezhi.entity.*;
import com.liezhi.exception.BadRequestException;
import com.liezhi.exception.BusinessException;
import com.liezhi.repository.*;
import com.liezhi.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final UserJobPreferenceRepository preferenceRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final SmsService smsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;

    private static final String[] AVATAR_COLORS = {
        "#1A1A2E", "#0052D9", "#FF2741", "#FFB800", "#2932E1", "#CC0000"
    };

    public AuthService(UserRepository userRepository, ResumeRepository resumeRepository,
                       UserJobPreferenceRepository preferenceRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       SmsService smsService, PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider, JwtProperties jwtProperties) {
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.preferenceRepository = preferenceRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.smsService = smsService;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtProperties = jwtProperties;
    }

    public LoginResponse login(String phone, String password) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new BadRequestException("用户不存在"));

        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new BadRequestException("密码错误");
        }

        return buildLoginResponse(user);
    }

    @Transactional
    public LoginResponse register(String name, String phone, String smsCode, String password,
                                   String expectedPosition, String expectedCity, String expectedSalary) {
        // Verify SMS code
        if (!smsService.verifyCode(phone, smsCode)) {
            throw new BadRequestException("验证码错误或已过期");
        }

        // Check phone uniqueness
        if (userRepository.existsByPhone(phone)) {
            throw new BusinessException(10001, "手机号已注册");
        }

        // Create user
        User user = new User();
        user.setName(name);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(password));
        user.setAvatarColor(AVATAR_COLORS[(int) (Math.random() * AVATAR_COLORS.length)]);
        user = userRepository.save(user);

        // Create empty resume
        Resume resume = new Resume();
        resume.setUser(user);
        resume.setPhone(phone.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2"));
        resume.setName(name);
        resumeRepository.save(resume);

        // Create job preference
        UserJobPreference preference = new UserJobPreference();
        preference.setUser(user);
        preference.setExpectedPosition(expectedPosition);
        preference.setExpectedCity(expectedCity);
        preference.setExpectedSalary(expectedSalary);
        preferenceRepository.save(preference);

        return buildLoginResponse(user);
    }

    public TokenRefreshResponse refreshToken(String refreshTokenStr) {
        RefreshToken rt = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new BadRequestException("无效的refreshToken"));

        if (rt.isExpired()) {
            refreshTokenRepository.delete(rt);
            throw new BadRequestException("refreshToken已过期，请重新登录");
        }

        User user = rt.getUser();
        // Delete old refresh token (rotation)
        refreshTokenRepository.delete(rt);

        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getPhone());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        RefreshToken newRt = new RefreshToken(user, newRefreshToken,
                LocalDateTime.now().plusSeconds(jwtProperties.getRefreshTokenExpiration() / 1000));
        refreshTokenRepository.save(newRt);

        return new TokenRefreshResponse(newAccessToken, newRefreshToken, jwtProperties.getAccessTokenExpiration());
    }

    public void resetPassword(String phone, String smsCode, String newPassword) {
        if (!smsService.verifyCode(phone, smsCode)) {
            throw new BadRequestException("验证码错误或已过期");
        }

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new BadRequestException("用户不存在"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public LoginResponse socialLogin(String type, String code) {
        // Stub: mock social login
        String mockPhone = type + "_mock_" + code.hashCode();
        String mockName = type + "用户";

        User user = userRepository.findByPhone(mockPhone).orElseGet(() -> {
            User newUser = new User();
            newUser.setPhone(mockPhone);
            newUser.setName(mockName);
            newUser.setAvatarColor(AVATAR_COLORS[(int) (Math.random() * AVATAR_COLORS.length)]);
            newUser.setSocialType(type);
            newUser.setSocialOpenId("mock_openid_" + code);
            newUser = userRepository.save(newUser);

            Resume resume = new Resume();
            resume.setUser(newUser);
            resume.setName(mockName);
            resumeRepository.save(resume);

            return newUser;
        });

        return buildLoginResponse(user);
    }

    private LoginResponse buildLoginResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getPhone());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        RefreshToken rt = new RefreshToken(user, refreshToken,
                LocalDateTime.now().plusSeconds(jwtProperties.getRefreshTokenExpiration() / 1000));
        refreshTokenRepository.save(rt);

        String maskedPhone = user.getPhone().replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2");

        LoginResponse.UserBrief userBrief = new LoginResponse.UserBrief(
                user.getId(), user.getName(), user.getAvatarColor(), maskedPhone, user.getTitle());

        return new LoginResponse(accessToken, refreshToken, jwtProperties.getAccessTokenExpiration(), userBrief);
    }
}
