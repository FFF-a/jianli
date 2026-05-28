package com.liezhi.dto.response;

import java.util.List;

public class JobListResponse {
    private long total;
    private int page;
    private int size;
    private List<BannerItem> banners;
    private List<JobBrief> list;

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public List<BannerItem> getBanners() { return banners; }
    public void setBanners(List<BannerItem> banners) { this.banners = banners; }
    public List<JobBrief> getList() { return list; }
    public void setList(List<JobBrief> list) { this.list = list; }

    public static class BannerItem {
        private Long id;
        private String title;
        private String subtitle;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getSubtitle() { return subtitle; }
        public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
    }
}
