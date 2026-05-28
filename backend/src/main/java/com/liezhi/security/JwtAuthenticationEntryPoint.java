package com.liezhi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.liezhi.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(401);
        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getOutputStream(), ApiResponse.error(401, "请先登录"));
    }
}
