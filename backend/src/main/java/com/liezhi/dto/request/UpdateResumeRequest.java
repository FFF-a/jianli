package com.liezhi.dto.request;

import java.util.List;

public class UpdateResumeRequest {
    private String title;
    private String school;
    private String major;
    private String schoolPeriod;
    private String phone;
    private String email;
    private String location;
    private String workMode;
    private List<WorkExpItem> workExperiences;
    private List<EducationItem> educations;
    private List<String> skills;

    public static class WorkExpItem {
        private Long id;
        private String company;
        private String title;
        private String period;
        private String description;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class EducationItem {
        private Long id;
        private String school;
        private String degree;
        private String major;
        private String period;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getSchool() { return school; }
        public void setSchool(String school) { this.school = school; }
        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }
        public String getMajor() { return major; }
        public void setMajor(String major) { this.major = major; }
        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSchool() { return school; }
    public void setSchool(String school) { this.school = school; }
    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }
    public String getSchoolPeriod() { return schoolPeriod; }
    public void setSchoolPeriod(String schoolPeriod) { this.schoolPeriod = schoolPeriod; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }
    public List<WorkExpItem> getWorkExperiences() { return workExperiences; }
    public void setWorkExperiences(List<WorkExpItem> workExperiences) { this.workExperiences = workExperiences; }
    public List<EducationItem> getEducations() { return educations; }
    public void setEducations(List<EducationItem> educations) { this.educations = educations; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
}
