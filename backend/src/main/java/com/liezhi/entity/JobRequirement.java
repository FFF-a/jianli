package com.liezhi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "job_requirements")
public class JobRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private Integer sortOrder = 0;

    public JobRequirement() {}
    public JobRequirement(String content, Integer sortOrder) { this.content = content; this.sortOrder = sortOrder; }
    public JobRequirement(Job job, String content, Integer sortOrder) { this.job = job; this.content = content; this.sortOrder = sortOrder; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
