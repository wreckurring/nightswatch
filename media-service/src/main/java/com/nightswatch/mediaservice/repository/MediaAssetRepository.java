package com.nightswatch.mediaservice.repository;

import com.nightswatch.mediaservice.entity.MediaAsset;
import com.nightswatch.mediaservice.entity.MediaProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MediaAssetRepository extends JpaRepository<MediaAsset, UUID> {
    Optional<MediaAsset> findByNormalizedUrl(String normalizedUrl);
    List<MediaAsset> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    List<MediaAsset> findByProviderOrderByCreatedAtDesc(MediaProvider provider);
}
