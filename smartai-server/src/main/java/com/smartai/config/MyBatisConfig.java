package com.smartai.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.smartai.mapper")
public class MyBatisConfig {
}
