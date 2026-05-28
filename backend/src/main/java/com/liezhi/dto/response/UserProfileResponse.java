package com.liezhi.dto.response;

public class UserProfileResponse {
    private Long id;
    private String name;
    private String avatarColor;
    private String phone;
    private String email;
    private String gender;
    private Integer age;
    private String title;
    private String experience;
    private String education;
    private String location;
    private String status;
    private int resumeCompletion;
    private String desiredPosition;
    private String desiredCity;
    private String desiredSalary;

    // Getters / Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAvatarColor() { return avatarColor; }
    public void setAvatarColor(String avatarColor) { this.avatarColor = avatarColor; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getResumeCompletion() { return resumeCompletion; }
    public void setResumeCompletion(int resumeCompletion) { this.resumeCompletion = resumeCompletion; }
    public String getDesiredPosition() { return desiredPosition; }
    public void setDesiredPosition(String desiredPosition) { this.desiredPosition = desiredPosition; }
    public String getDesiredCity() { return desiredCity; }
    public void setDesiredCity(String desiredCity) { this.desiredCity = desiredCity; }
    public String getDesiredSalary() { return desiredSalary; }
    public void setDesiredSalary(String desiredSalary) { this.desiredSalary = desiredSalary; }
}
