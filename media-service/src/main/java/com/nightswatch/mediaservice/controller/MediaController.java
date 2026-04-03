package com.nightswatch.mediaservice.controller;

import com.nightswatch.mediaservice.dto.AnalyzeMediaRequest;
import com.nightswatch.mediaservice.dto.AnalyzeMediaResponse;
import com.nightswatch.mediaservice.dto.CreateMediaAssetRequest;
import com.nightswatch.mediaservice.dto.MediaAssetResponse;
import com.nightswatch.mediaservice.dto.MediaQueryResponse;
import com.nightswatch.mediaservice.entity.MediaProvider;
import com.nightswatch.mediaservice.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
@Validated
@Tag(name = "Media", description = "APIs for URL analysis and media asset management")
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/analyze")
    @Operation(summary = "Analyze a media URL", description = "Detects provider, type, embeddability, and normalized URL without persisting")
    public ResponseEntity<AnalyzeMediaResponse> analyze(@Valid @RequestBody AnalyzeMediaRequest request) {
        return ResponseEntity.ok(mediaService.analyzeUrl(request));
    }

    @PostMapping("/assets")
    @Operation(summary = "Create a media asset", description = "Validates and persists a media asset; returns existing record if URL already registered")
    public ResponseEntity<MediaAssetResponse> createAsset(@Valid @RequestBody CreateMediaAssetRequest request) {
        return ResponseEntity.ok(mediaService.createAsset(request));
    }

    @GetMapping("/assets/{id}")
    @Operation(summary = "Get a media asset by ID")
    public ResponseEntity<MediaAssetResponse> getAsset(@PathVariable UUID id) {
        return ResponseEntity.ok(mediaService.getAsset(id));
    }

    @GetMapping("/assets")
    @Operation(summary = "List media assets", description = "Filter by createdBy or provider (mutually exclusive; createdBy takes precedence)")
    public ResponseEntity<MediaQueryResponse> listAssets(
            @RequestParam(required = false) String createdBy,
            @RequestParam(required = false) MediaProvider provider) {

        if (createdBy != null) {
            return ResponseEntity.ok(mediaService.getAssetsByCreator(createdBy));
        }
        if (provider != null) {
            return ResponseEntity.ok(mediaService.getAssetsByProvider(provider));
        }
        return ResponseEntity.ok(MediaQueryResponse.builder().items(java.util.List.of()).build());
    }
}
