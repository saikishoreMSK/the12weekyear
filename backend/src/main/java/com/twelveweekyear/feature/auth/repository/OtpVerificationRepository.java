package com.twelveweekyear.feature.auth.repository;

import com.twelveweekyear.feature.auth.domain.OtpPurpose;
import com.twelveweekyear.feature.auth.domain.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {

    /** The most recent still-active (not consumed) OTP for a user + purpose. */
    Optional<OtpVerification> findFirstByUserIdAndPurposeAndConsumedFalseOrderByCreatedAtDesc(
            UUID userId, OtpPurpose purpose);

    /** Supersede any outstanding codes before issuing a new one. */
    @Modifying
    @Query("update OtpVerification o set o.consumed = true "
            + "where o.userId = :userId and o.purpose = :purpose and o.consumed = false")
    void consumeAllForUserAndPurpose(@Param("userId") UUID userId, @Param("purpose") OtpPurpose purpose);

    void deleteByUserId(UUID userId);
}
