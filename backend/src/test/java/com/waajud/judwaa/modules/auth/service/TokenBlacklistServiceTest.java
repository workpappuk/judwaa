package com.waajud.judwaa.modules.auth.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.waajud.judwaa.modules.auth.jwt.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.lang.reflect.Field;
import java.util.Date;
import java.util.Map;
import java.util.Set;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

class TokenBlacklistServiceTest {

    private static final SecretKey SECRET_KEY = Keys
            .hmacShaKeyFor("my-super-secret-key-which-should-be-longer".getBytes());

    @Test
    void blacklistToken_activeToken_isBlacklisted() {
        TokenBlacklistService service = new TokenBlacklistService();
        String token = JwtUtil.generateToken("user", Set.of("USER"));

        service.blacklistToken(token);

        assertTrue(service.isBlacklisted(token));
    }

    @Test
    void blacklistToken_expiredToken_isIgnored() {
        TokenBlacklistService service = new TokenBlacklistService();
        String expiredToken = Jwts.builder()
                .subject("user")
                .claim("roles", Set.of("USER"))
                .issuedAt(new Date(System.currentTimeMillis() - 10_000L))
                .expiration(new Date(System.currentTimeMillis() - 1_000L))
                .signWith(SECRET_KEY)
                .compact();

        assertThrows(io.jsonwebtoken.ExpiredJwtException.class, () -> service.blacklistToken(expiredToken));
    }

    @Test
    void isBlacklisted_unknownToken_returnsFalse() {
        TokenBlacklistService service = new TokenBlacklistService();

        assertFalse(service.isBlacklisted("missing"));
    }

    @Test
    void isBlacklisted_expiredEntry_isEvicted() {
        TokenBlacklistService service = new TokenBlacklistService();
        String token = "manual-token";
        try {
            Field field = TokenBlacklistService.class.getDeclaredField("blacklistedTokens");
            field.setAccessible(true);
            @SuppressWarnings("unchecked")
            Map<String, Long> map = (Map<String, Long>) field.get(service);
            map.put(token, System.currentTimeMillis() - 1000L);
        } catch (ReflectiveOperationException ex) {
            throw new RuntimeException(ex);
        }

        assertFalse(service.isBlacklisted(token));
    }

    @Test
    void blacklistToken_withPastExpiryFromClaims_doesNotBlacklist() {
        TokenBlacklistService service = new TokenBlacklistService();
        Claims claims = Mockito.mock(Claims.class);
        when(claims.getExpiration()).thenReturn(new Date(System.currentTimeMillis() - 1000L));

        try (MockedStatic<JwtUtil> jwtUtil = Mockito.mockStatic(JwtUtil.class)) {
            jwtUtil.when(() -> JwtUtil.extractClaims("t")).thenReturn(claims);
            service.blacklistToken("t");
        }

        assertFalse(service.isBlacklisted("t"));
    }
}
