package com.liezhi.dto.response;

public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private UserBrief user;

    public LoginResponse(String accessToken, String refreshToken, long expiresIn, UserBrief user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.user = user;
    }

    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public long getExpiresIn() { return expiresIn; }
    public UserBrief getUser() { return user; }

    public static class UserBrief {
        private Long id;
        private String name;
        private String avatarColor;
        private String phone;
        private String title;

        public UserBrief(Long id, String name, String avatarColor, String phone, String title) {
            this.id = id;
            this.name = name;
            this.avatarColor = avatarColor;
            this.phone = phone;
            this.title = title;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getAvatarColor() { return avatarColor; }
        public String getPhone() { return phone; }
        public String getTitle() { return title; }
    }
}
