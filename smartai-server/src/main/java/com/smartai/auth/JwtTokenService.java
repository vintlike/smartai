package com.smartai.auth;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 纯 JDK 实现的 HS256 令牌服务。
 */
@Component
public class JwtTokenService {

    private static final String HEADER = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String ISSUER_ALG = "HmacSHA256";

    private final Gson gson = new Gson();
    private final Base64.Encoder urlEncoder = Base64.getUrlEncoder().withoutPadding();
    private final Base64.Decoder urlDecoder = Base64.getUrlDecoder();

    @Value("${smartai.auth.secret}")
    private String secret;

    @Value("${smartai.auth.expire-minutes:720}")
    private long expireMinutes;

    public String create(String userId, String username) {
        long now = System.currentTimeMillis() / 1000;
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", userId);
        payload.put("usr", username);
        payload.put("iat", now);
        payload.put("exp", now + expireMinutes * 60);
        String headerPart = urlEncoder.encodeToString(HEADER.getBytes(StandardCharsets.UTF_8));
        String payloadPart = urlEncoder.encodeToString(gson.toJson(payload).getBytes(StandardCharsets.UTF_8));
        String signature = sign(headerPart + "." + payloadPart);
        return headerPart + "." + payloadPart + "." + signature;
    }

    public String resolveUserId(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return null;
        }
        String expected = sign(parts[0] + "." + parts[1]);
        if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                parts[2].getBytes(StandardCharsets.UTF_8))) {
            return null;
        }
        try {
            String json = new String(urlDecoder.decode(parts[1]), StandardCharsets.UTF_8);
            JsonObject payload = gson.fromJson(json, JsonObject.class);
            if (payload == null || !payload.has("exp") || !payload.has("sub")) {
                return null;
            }
            long exp = payload.get("exp").getAsLong();
            if (exp < System.currentTimeMillis() / 1000) {
                return null;
            }
            return payload.get("sub").getAsString();
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private String sign(String content) {
        try {
            Mac mac = Mac.getInstance(ISSUER_ALG);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            return urlEncoder.encodeToString(mac.doFinal(content.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("令牌签名失败", ex);
        }
    }
}
