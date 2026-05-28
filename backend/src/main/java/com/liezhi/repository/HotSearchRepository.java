package com.liezhi.repository;

import com.liezhi.entity.HotSearch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HotSearchRepository extends JpaRepository<HotSearch, Long> {
    List<HotSearch> findTop10ByOrderBySearchCountDesc();

    Optional<HotSearch> findByKeyword(String keyword);
}
