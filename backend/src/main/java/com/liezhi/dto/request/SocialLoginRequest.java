package com.liezhi.dto.request;

import jakarta.validation.constraints.NotBlank;

public class SocialLoginRequest {

    @NotBlank(message = "缺少授权code")
    private String code;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
