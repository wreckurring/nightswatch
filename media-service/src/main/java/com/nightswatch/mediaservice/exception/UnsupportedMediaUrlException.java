package com.nightswatch.mediaservice.exception;

public class UnsupportedMediaUrlException extends RuntimeException {
    public UnsupportedMediaUrlException(String url) {
        super("Unsupported or invalid media URL: " + url);
    }
}
