package com.nightswatch.roomservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class LoggingConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new RequestLoggingInterceptor());
    }

    @Slf4j
    public static class RequestLoggingInterceptor implements HandlerInterceptor {
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
            long startTime = System.currentTimeMillis();
            request.setAttribute("startTime", startTime);
            log.info("[{}] {} {}", request.getMethod(), request.getRequestURI(), 
                    request.getQueryString() != null ? request.getQueryString() : "");
            return true;
        }

        @Override
        public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                                    Object handler, Exception ex) {
            long startTime = (Long) request.getAttribute("startTime");
            long duration = System.currentTimeMillis() - startTime;
            log.info("[{}] {} {} - Status: {} - Duration: {}ms", 
                    request.getMethod(), request.getRequestURI(), 
                    request.getQueryString() != null ? request.getQueryString() : "",
                    response.getStatus(), duration);
        }
    }
}
