package com.smartai.server.common.config;

import java.util.List;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "smartai.cors")
public class CorsProperties {

    private List<String> allowedOriginPatterns = List.of("*");
}
