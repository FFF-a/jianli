package com.liezhi.dto.response;

import java.util.List;

public class ResumeResponse {
    private String name;
    private String title;
    private String gender;
    private Integer age;
    private String experience;
    private String education;
    private String school;
    private String major;
    private String schoolPeriod;
    private String phone;
    private String email;
    private String location;
    private String workMode;
    private int completeness;
    private List<WorkExp> workExperiences;
    private List<EducationItem> educations;
    private List<String> skills;

    public static class WorkExp {
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

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
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
    public int getCompleteness() { return completeness; }
    public void setCompleteness(int completeness) { this.completeness = completeness; }
    public List<WorkExp> getWorkExperiences() { return workExperiences; }
    public void setWorkExperiences(List<WorkExp> workExperiences) { this.workExperiences = workExperiences; }
    public List<EducationItem> getEducations() { return educations; }
    public void setEducations(List<EducationItem> educations) { this.educations = educations; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
}
