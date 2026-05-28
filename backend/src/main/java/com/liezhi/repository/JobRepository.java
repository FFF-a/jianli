package com.liezhi.repository;

import com.liezhi.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobRepository extends JpaRepository<Job, Long> {

    Page<Job> findByIsActiveTrueOrderByPostedAtDesc(Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.isActive = true AND " +
           "(:keyword IS NULL OR j.title LIKE %:keyword% OR j.company LIKE %:keyword%) AND " +
           "(:city IS NULL OR j.city = :city) AND " +
           "(:jobType IS NULL OR j.jobType = :jobType) AND " +
           "(:education IS NULL OR j.education = :education) AND " +
           "(:experience IS NULL OR j.experience = :experience) " +
           "ORDER BY j.postedAt DESC")
    Page<Job> search(@Param("keyword") String keyword,
                     @Param("city") String city,
                     @Param("jobType") String jobType,
                     @Param("education") String education,
                     @Param("experience") String experience,
                     Pageable pageable);
}
