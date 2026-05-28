package com.liezhi.dto.response;

public class UserStatsResponse {
    private long appliedCount;
    private long pendingReplyCount;
    private long favoriteCount;
    private long interviewCount;
    private long offerCount;

    public long getAppliedCount() { return appliedCount; }
    public void setAppliedCount(long appliedCount) { this.appliedCount = appliedCount; }
    public long getPendingReplyCount() { return pendingReplyCount; }
    public void setPendingReplyCount(long pendingReplyCount) { this.pendingReplyCount = pendingReplyCount; }
    public long getFavoriteCount() { return favoriteCount; }
    public void setFavoriteCount(long favoriteCount) { this.favoriteCount = favoriteCount; }
    public long getInterviewCount() { return interviewCount; }
    public void setInterviewCount(long interviewCount) { this.interviewCount = interviewCount; }
    public long getOfferCount() { return offerCount; }
    public void setOfferCount(long offerCount) { this.offerCount = offerCount; }
}
