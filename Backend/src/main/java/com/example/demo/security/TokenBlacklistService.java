package com.example.demo.security;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class TokenBlacklistService {
    private final Map<String, Long> blacklist = new ConcurrentHashMap<>();

    private final JwtService jwtService;

    public TokenBlacklistService(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public void blacklist(String token) {
        try {
            Date expiry = jwtService.extractExpiration(token);
            if (expiry != null) {
                blacklist.put(token, expiry.getTime());
            }
        } catch (Exception ignored) {
            blacklist.put(token, System.currentTimeMillis() + 24 * 60 * 60 * 1000L);
        }
    }

    public boolean isBlacklisted(String token) {
        return blacklist.containsKey(token);
    }

    @Scheduled(fixedRate = 10 * 60 * 1000)
    public void purgeExpiredTokens() {
        long now = System.currentTimeMillis();
        blacklist.entrySet().removeIf(entry -> entry.getValue() < now);
    }
}
