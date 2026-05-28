package com.liezhi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "job_tags")
public class JobTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(nullable = false, length = 30)
    private String tag;

    private Integer sortOrder = 0;

    public JobTag() {}
    public JobTag(String tag, Integer sortOrder) { this.tag = tag; this.sortOrder = sortOrder; }
    public JobTag(Job job, String tag, Integer sortOrder) { this.job = job; this.tag = tag; this.sortOrder = sortOrder; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
