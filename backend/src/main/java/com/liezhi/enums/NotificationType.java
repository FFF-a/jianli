package com.liezhi.enums;

public enum NotificationType {
    APPLICATION_UPDATE("投递状态更新"),
    INTERVIEW_INVITE("面试邀请"),
    SYSTEM("系统通知"),
    OFFER("Offer通知");

    private final String label;

    NotificationType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
