package com.liezhi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "job_welfares")
public class JobWelfare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(nullable = false, length = 30)
    private String name;

    private Integer sortOrder = 0;

    public JobWelfare() {}
    public JobWelfare(String name, Integer sortOrder) { this.name = name; this.sortOrder = sortOrder; }
    public JobWelfare(Job job, String name, Integer sortOrder) { this.job = job; this.name = name; this.sortOrder = sortOrder; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
