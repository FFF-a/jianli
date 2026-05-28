package com.liezhi.dto.response;

import java.util.List;

public class JobDetailResponse {
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
    private boolean isApplied;
    private String desc;
    private List<String> requirements;
    private List<String> welfare;
    private String companySize;
    private String companyType;
    private String companyStage;
    private String industry;

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
    public boolean getIsApplied() { return isApplied; }
    public void setIsApplied(boolean isApplied) { this.isApplied = isApplied; }
    public String getDesc() { return desc; }
    public void setDesc(String desc) { this.desc = desc; }
    public List<String> getRequirements() { return requirements; }
    public void setRequirements(List<String> requirements) { this.requirements = requirements; }
    public List<String> getWelfare() { return welfare; }
    public void setWelfare(List<String> welfare) { this.welfare = welfare; }
    public String getCompanySize() { return companySize; }
    public void setCompanySize(String companySize) { this.companySize = companySize; }
    public String getCompanyType() { return companyType; }
    public void setCompanyType(String companyType) { this.companyType = companyType; }
    public String getCompanyStage() { return companyStage; }
    public void setCompanyStage(String companyStage) { this.companyStage = companyStage; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
}
