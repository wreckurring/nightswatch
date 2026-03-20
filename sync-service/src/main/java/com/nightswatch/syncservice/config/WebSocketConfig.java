package com.nightswatch.syncservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@Slf4j
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${sync-service.broker.type:simple}")
    private String brokerType;

    @Value("${sync-service.broker.relay-host:localhost}")
    private String relayHost;

    @Value("${sync-service.broker.relay-port:61613}")
    private int relayPort;

    @Value("${sync-service.broker.relay-login:guest}")
    private String relayLogin;

    @Value("${sync-service.broker.relay-password:guest}")
    private String relayPassword;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        if ("relay".equalsIgnoreCase(brokerType)) {
            log.info("Configuring STOMP Broker Relay - Host: {}, Port: {}", relayHost, relayPort);
            config.enableStompBrokerRelay("/topic")
                    .setRelayHost(relayHost)
                    .setRelayPort(relayPort)
                    .setClientLogin(relayLogin)
                    .setClientPasscode(relayPassword)
                    .setSystemLogin(relayLogin)
                    .setSystemPasscode(relayPassword);
        } else {
            log.info("Configuring Simple Broker (single instance mode)");
            config.enableSimpleBroker("/topic");
        }
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-sync")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
