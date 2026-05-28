package com.liezhi.dto.response;

public class UnreadCountResponse {
    private long unreadCount;

    public UnreadCountResponse(long unreadCount) {
        this.unreadCount = unreadCount;
    }

    public long getUnreadCount() { return unreadCount; }
}
