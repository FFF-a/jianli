package com.liezhi.enums;

public enum ApplicationStatus {
    PENDING("待查看"),
    VIEWED("已查看"),
    INTERVIEW("面试邀请"),
    OFFER("收到Offer"),
    REJECTED("未通过");

    private final String label;

    ApplicationStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
