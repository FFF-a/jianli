package com.liezhi.repository;

import com.liezhi.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    long countByUserIdAndIsReadFalse(Long userId);

    void deleteByReferenceId(Long referenceId);
}
