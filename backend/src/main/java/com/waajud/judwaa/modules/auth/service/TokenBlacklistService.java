package com.waajud.judwaa.modules.auth.service;

import com.waajud.judwaa.modules.auth.jwt.JwtUtil;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class TokenBlacklistService {
	private final Map<String, Long> blacklistedTokens = new ConcurrentHashMap<>();

	public void blacklistToken(String token) {
		long expirationTime = JwtUtil.extractClaims(token).getExpiration().getTime();
		if (expirationTime > System.currentTimeMillis()) {
			blacklistedTokens.put(token, expirationTime);
		}
	}

	public boolean isBlacklisted(String token) {
		Long expirationTime = blacklistedTokens.get(token);
		if (expirationTime == null) {
			return false;
		}

		if (expirationTime <= System.currentTimeMillis()) {
			blacklistedTokens.remove(token);
			return false;
		}

		return true;
	}
}