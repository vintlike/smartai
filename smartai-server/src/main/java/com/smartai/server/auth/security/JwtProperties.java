package com.smartai.server.auth.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "smartai.security.jwt")
public class JwtProperties {

    private String secret;
    private long expirationSeconds = 7200;
}
