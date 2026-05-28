package com.liezhi.dto.request;

public class UpdateProfileRequest {
    private String name;
    private String title;
    private String location;
    private String email;
    private String gender;
    private Integer age;
    private String education;
    private String status;
    private String desiredPosition;
    private String desiredCity;
    private String desiredSalary;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDesiredPosition() { return desiredPosition; }
    public void setDesiredPosition(String desiredPosition) { this.desiredPosition = desiredPosition; }
    public String getDesiredCity() { return desiredCity; }
    public void setDesiredCity(String desiredCity) { this.desiredCity = desiredCity; }
    public String getDesiredSalary() { return desiredSalary; }
    public void setDesiredSalary(String desiredSalary) { this.desiredSalary = desiredSalary; }
}
