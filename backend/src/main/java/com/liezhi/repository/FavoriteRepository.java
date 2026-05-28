package com.liezhi.repository;

import com.liezhi.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByUserIdAndJobId(Long userId, Long jobId);

    boolean existsByUserIdAndJobId(Long userId, Long jobId);

    @Query("SELECT f FROM Favorite f JOIN FETCH f.job WHERE f.user.id = :userId ORDER BY f.createdAt DESC")
    Page<Favorite> findByUserId(@Param("userId") Long userId, Pageable pageable);

    long countByUserId(Long userId);
}
