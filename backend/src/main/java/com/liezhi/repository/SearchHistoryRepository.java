package com.liezhi.repository;

import com.liezhi.entity.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    List<SearchHistory> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
}
