package com.smartai.server.log;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "smartai.operation-log")
public class OperationLogProperties {

    private boolean enabled = true;
}
