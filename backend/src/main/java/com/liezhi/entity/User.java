package com.liezhi.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    private String password;

    @Column(nullable = false, length = 20)
    private String name;

    @Column(length = 7)
    private String avatarColor;

    @Column(length = 10)
    private String gender;

    private Integer age;

    @Column(length = 50)
    private String title;

    private Integer experienceYears;

    @Column(length = 10)
    private String education;

    @Column(length = 50)
    private String location;

    @Column(length = 100)
    private String email;

    private Boolean isJobSeeking = true;

    @Column(length = 20)
    private String socialType;

    private String socialOpenId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // ========== Getters / Setters ==========

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAvatarColor() { return avatarColor; }
    public void setAvatarColor(String avatarColor) { this.avatarColor = avatarColor; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Boolean getIsJobSeeking() { return isJobSeeking; }
    public void setIsJobSeeking(Boolean isJobSeeking) { this.isJobSeeking = isJobSeeking; }

    public String getSocialType() { return socialType; }
    public void setSocialType(String socialType) { this.socialType = socialType; }

    public String getSocialOpenId() { return socialOpenId; }
    public void setSocialOpenId(String socialOpenId) { this.socialOpenId = socialOpenId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
