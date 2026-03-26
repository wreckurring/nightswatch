package com.nightswatch.mediaservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "media_assets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaAsset {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 1024)
    private String sourceUrl;

    @Column(nullable = false, length = 1024, unique = true)
    private String normalizedUrl;

    @Column(nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MediaProvider provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MediaType mediaType;

    @Column(nullable = false)
    private boolean embeddable;

    @Column(nullable = false, length = 255)
    private String createdBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
