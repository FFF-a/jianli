package com.liezhi.repository;

import com.liezhi.entity.UserJobPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserJobPreferenceRepository extends JpaRepository<UserJobPreference, Long> {
    Optional<UserJobPreference> findByUserId(Long userId);
}
