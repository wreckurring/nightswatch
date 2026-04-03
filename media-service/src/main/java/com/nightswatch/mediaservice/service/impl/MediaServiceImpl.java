package com.nightswatch.mediaservice.service.impl;

import com.nightswatch.mediaservice.dto.AnalyzeMediaRequest;
import com.nightswatch.mediaservice.dto.AnalyzeMediaResponse;
import com.nightswatch.mediaservice.dto.CreateMediaAssetRequest;
import com.nightswatch.mediaservice.dto.MediaAssetResponse;
import com.nightswatch.mediaservice.dto.MediaQueryResponse;
import com.nightswatch.mediaservice.entity.MediaAsset;
import com.nightswatch.mediaservice.entity.MediaProvider;
import com.nightswatch.mediaservice.entity.MediaType;
import com.nightswatch.mediaservice.exception.MediaAssetNotFoundException;
import com.nightswatch.mediaservice.exception.UnsupportedMediaUrlException;
import com.nightswatch.mediaservice.repository.MediaAssetRepository;
import com.nightswatch.mediaservice.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

    private static final Pattern YOUTUBE_LONG = Pattern.compile(
            "(?:https?://)?(?:www\\.)?youtube\\.com/watch\\?.*v=([a-zA-Z0-9_-]{11})");
    private static final Pattern YOUTUBE_SHORT = Pattern.compile(
            "(?:https?://)?youtu\\.be/([a-zA-Z0-9_-]{11})");
    private static final Pattern VIMEO = Pattern.compile(
            "(?:https?://)?(?:www\\.)?vimeo\\.com/(\\d+)");
    private static final Pattern DIRECT_VIDEO = Pattern.compile(
            "(?:https?://).+\\.(?:mp4|webm|ogg|mov|avi)(\\?.*)?$", Pattern.CASE_INSENSITIVE);

    private final MediaAssetRepository mediaAssetRepository;

    @Override
    public AnalyzeMediaResponse analyzeUrl(AnalyzeMediaRequest request) {
        return analyze(request.getUrl());
    }

    @Override
    @Transactional
    public MediaAssetResponse createAsset(CreateMediaAssetRequest request) {
        AnalyzeMediaResponse analysis = analyze(request.getUrl());

        if (!analysis.isSupported()) {
            throw new UnsupportedMediaUrlException(request.getUrl());
        }

        MediaAsset asset = mediaAssetRepository.findByNormalizedUrl(analysis.getNormalizedUrl())
                .orElseGet(() -> mediaAssetRepository.save(MediaAsset.builder()
                        .sourceUrl(analysis.getSourceUrl())
                        .normalizedUrl(analysis.getNormalizedUrl())
                        .title(request.getTitle())
                        .provider(analysis.getProvider())
                        .mediaType(analysis.getMediaType())
                        .embeddable(analysis.isEmbeddable())
                        .createdBy(request.getCreatedBy())
                        .build()));

        return toDto(asset);
    }

    @Override
    @Transactional(readOnly = true)
    public MediaAssetResponse getAsset(UUID id) {
        MediaAsset asset = mediaAssetRepository.findById(id)
                .orElseThrow(() -> new MediaAssetNotFoundException(id));
        return toDto(asset);
    }

    @Override
    @Transactional(readOnly = true)
    public MediaQueryResponse getAssetsByCreator(String createdBy) {
        List<MediaAssetResponse> items = mediaAssetRepository
                .findByCreatedByOrderByCreatedAtDesc(createdBy)
                .stream()
                .map(this::toDto)
                .toList();
        return MediaQueryResponse.builder().items(items).build();
    }

    @Override
    @Transactional(readOnly = true)
    public MediaQueryResponse getAssetsByProvider(MediaProvider provider) {
        List<MediaAssetResponse> items = mediaAssetRepository
                .findByProviderOrderByCreatedAtDesc(provider)
                .stream()
                .map(this::toDto)
                .toList();
        return MediaQueryResponse.builder().items(items).build();
    }

    private AnalyzeMediaResponse analyze(String url) {
        Matcher ytLong = YOUTUBE_LONG.matcher(url);
        if (ytLong.find()) {
            String videoId = ytLong.group(1);
            return AnalyzeMediaResponse.builder()
                    .sourceUrl(url)
                    .normalizedUrl("https://www.youtube.com/embed/" + videoId)
                    .provider(MediaProvider.YOUTUBE)
                    .mediaType(MediaType.VIDEO)
                    .embeddable(true)
                    .supported(true)
                    .build();
        }

        Matcher ytShort = YOUTUBE_SHORT.matcher(url);
        if (ytShort.find()) {
            String videoId = ytShort.group(1);
            return AnalyzeMediaResponse.builder()
                    .sourceUrl(url)
                    .normalizedUrl("https://www.youtube.com/embed/" + videoId)
                    .provider(MediaProvider.YOUTUBE)
                    .mediaType(MediaType.VIDEO)
                    .embeddable(true)
                    .supported(true)
                    .build();
        }

        Matcher vimeo = VIMEO.matcher(url);
        if (vimeo.find()) {
            String videoId = vimeo.group(1);
            return AnalyzeMediaResponse.builder()
                    .sourceUrl(url)
                    .normalizedUrl("https://player.vimeo.com/video/" + videoId)
                    .provider(MediaProvider.VIMEO)
                    .mediaType(MediaType.VIDEO)
                    .embeddable(true)
                    .supported(true)
                    .build();
        }

        if (DIRECT_VIDEO.matcher(url).matches()) {
            return AnalyzeMediaResponse.builder()
                    .sourceUrl(url)
                    .normalizedUrl(url)
                    .provider(MediaProvider.DIRECT_VIDEO)
                    .mediaType(MediaType.VIDEO)
                    .embeddable(false)
                    .supported(true)
                    .build();
        }

        return AnalyzeMediaResponse.builder()
                .sourceUrl(url)
                .normalizedUrl(url)
                .provider(MediaProvider.UNKNOWN)
                .mediaType(MediaType.UNKNOWN)
                .embeddable(false)
                .supported(false)
                .build();
    }

    private MediaAssetResponse toDto(MediaAsset asset) {
        return MediaAssetResponse.builder()
                .id(asset.getId())
                .sourceUrl(asset.getSourceUrl())
                .normalizedUrl(asset.getNormalizedUrl())
                .title(asset.getTitle())
                .provider(asset.getProvider())
                .mediaType(asset.getMediaType())
                .embeddable(asset.isEmbeddable())
                .createdBy(asset.getCreatedBy())
                .createdAt(asset.getCreatedAt())
                .build();
    }
}
