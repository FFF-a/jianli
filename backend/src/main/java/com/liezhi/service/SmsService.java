package com.liezhi.service;

import com.liezhi.entity.SmsCode;
import com.liezhi.repository.SmsCodeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);
    private final SmsCodeRepository smsCodeRepository;
    private final ConcurrentHashMap<String, LocalDateTime> lastSendMap = new ConcurrentHashMap<>();

    public SmsService(SmsCodeRepository smsCodeRepository) {
        this.smsCodeRepository = smsCodeRepository;
    }

    public void sendSms(String phone) {
        // Rate limit: 60 seconds
        LocalDateTime lastSend = lastSendMap.get(phone);
        if (lastSend != null && lastSend.plusSeconds(60).isAfter(LocalDateTime.now())) {
            throw new com.liezhi.exception.BadRequestException("发送太频繁，请60秒后再试");
        }

        // In dev mode, code is always 123456
        String code = "123456";
        log.info("=== SMS CODE for {}: {} ===", phone, code);

        SmsCode smsCode = new SmsCode();
        smsCode.setPhone(phone);
        smsCode.setCode(code);
        smsCode.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        smsCodeRepository.save(smsCode);

        lastSendMap.put(phone, LocalDateTime.now());
    }

    public boolean verifyCode(String phone, String code) {
        return smsCodeRepository
                .findTopByPhoneAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                        phone, LocalDateTime.now())
                .map(sc -> {
                    if (sc.getCode().equals(code)) {
                        sc.setUsed(true);
                        smsCodeRepository.save(sc);
                        return true;
                    }
                    return false;
                })
                .orElse(false);
    }
}
