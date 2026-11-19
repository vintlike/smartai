package com.smartai.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.ServerSocket;

/**
 * 配置端口被占用时向 +100 范围自动回退。
 */
@Slf4j
@Component
public class ServerPortConfig implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {

    @Value("${server.port:8090}")
    private int port;

    @Override
    public void customize(ConfigurableServletWebServerFactory factory) {
        if (port == 0) {
            return;
        }
        for (int candidate = port; candidate <= port + 100; candidate++) {
            if (isAvailable(candidate)) {
                factory.setPort(candidate);
                if (candidate == port) {
                    log.info("服务将启动于端口 {}", candidate);
                } else {
                    log.info("端口 {} 已被占用，服务将启动于端口 {}", port, candidate);
                }
                return;
            }
        }
        throw new IllegalStateException("在端口范围 " + port + "-" + (port + 100) + " 内未找到可用端口");
    }

    private boolean isAvailable(int candidate) {
        try (ServerSocket socket = new ServerSocket(candidate)) {
            return true;
        } catch (IOException ex) {
            return false;
        }
    }
}
