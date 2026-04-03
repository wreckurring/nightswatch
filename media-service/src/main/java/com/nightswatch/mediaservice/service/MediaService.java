package com.nightswatch.mediaservice.service;

import com.nightswatch.mediaservice.dto.AnalyzeMediaRequest;
import com.nightswatch.mediaservice.dto.AnalyzeMediaResponse;
import com.nightswatch.mediaservice.dto.CreateMediaAssetRequest;
import com.nightswatch.mediaservice.dto.MediaAssetResponse;
import com.nightswatch.mediaservice.dto.MediaQueryResponse;
import com.nightswatch.mediaservice.entity.MediaProvider;

import java.util.UUID;

public interface MediaService {
    AnalyzeMediaResponse analyzeUrl(AnalyzeMediaRequest request);
    MediaAssetResponse createAsset(CreateMediaAssetRequest request);
    MediaAssetResponse getAsset(UUID id);
    MediaQueryResponse getAssetsByCreator(String createdBy);
    MediaQueryResponse getAssetsByProvider(MediaProvider provider);
}
