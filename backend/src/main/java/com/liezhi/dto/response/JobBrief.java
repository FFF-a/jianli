package com.liezhi.dto.response;

import java.util.List;

public class JobBrief {
    private Long id;
    private String title;
    private String company;
    private String initials;
    private String logoColor;
    private String location;
    private String salary;
    private String experience;
    private String education;
    private int headcount;
    private List<String> tags;
    private boolean isNew;
    private boolean isHot;
    private String postedAt;
    private boolean isFavorited;

    // Getters / Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getInitials() { return initials; }
    public void setInitials(String initials) { this.initials = initials; }
    public String getLogoColor() { return logoColor; }
    public void setLogoColor(String logoColor) { this.logoColor = logoColor; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
    public int getHeadcount() { return headcount; }
    public void setHeadcount(int headcount) { this.headcount = headcount; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public boolean getIsNew() { return isNew; }
    public void setIsNew(boolean isNew) { this.isNew = isNew; }
    public boolean getIsHot() { return isHot; }
    public void setIsHot(boolean isHot) { this.isHot = isHot; }
    public String getPostedAt() { return postedAt; }
    public void setPostedAt(String postedAt) { this.postedAt = postedAt; }
    public boolean getIsFavorited() { return isFavorited; }
    public void setIsFavorited(boolean isFavorited) { this.isFavorited = isFavorited; }
}
