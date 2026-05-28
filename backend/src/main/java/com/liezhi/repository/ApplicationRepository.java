package com.liezhi.repository;

import com.liezhi.entity.Application;
import com.liezhi.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    @Query("SELECT a FROM Application a JOIN FETCH a.job WHERE a.user.id = :userId " +
           "AND (:status IS NULL OR a.status = :status) ORDER BY a.appliedAt DESC")
    Page<Application> findByUserIdAndStatus(@Param("userId") Long userId,
                                            @Param("status") ApplicationStatus status,
                                            Pageable pageable);

    boolean existsByUserIdAndJobId(Long userId, Long jobId);

    java.util.Optional<Application> findByUserIdAndJobId(Long userId, Long jobId);

    long countByUserId(Long userId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.user.id = :userId AND a.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") ApplicationStatus status);
}
