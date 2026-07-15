package com.waajud.judwaa.modules.auth.jwt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import java.lang.reflect.Field;
import java.util.Date;
import java.util.Set;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

class JwtUtilTest {

    @Test
    void generateAndExtractUsername_roundTrip() {
        String token = JwtUtil.generateToken("alice", Set.of("USER"));

        assertNotNull(token);
        assertEquals("alice", JwtUtil.extractUsername(token));
    }

    @Test
    void tokenValidity_checksUsernameMismatch() {
        String token = JwtUtil.generateToken("bob", Set.of("ADMIN"));

        assertTrue(JwtUtil.isTokenValid(token, "bob"));
        assertFalse(JwtUtil.isTokenValid(token, "alice"));
        assertFalse(JwtUtil.isTokenExpired(token));
    }

    @Test
    void expiredToken_isInvalidAndExpired() throws Exception {
        Field keyField = JwtUtil.class.getDeclaredField("SECRET_KEY");
        keyField.setAccessible(true);
        SecretKey secretKey = (SecretKey) keyField.get(null);

        String expiredToken = Jwts.builder()
                .subject("old-user")
                .issuedAt(new Date(System.currentTimeMillis() - 10_000))
                .expiration(new Date(System.currentTimeMillis() - 1_000))
                .signWith(secretKey)
                .compact();

        assertThrows(Exception.class, () -> JwtUtil.isTokenExpired(expiredToken));
        assertThrows(Exception.class, () -> JwtUtil.isTokenValid(expiredToken, "old-user"));
    }

    @Test
    void isTokenExpired_returnsTrueWhenClaimsDateIsPast() {
        Claims claims = Mockito.mock(Claims.class);
        Mockito.when(claims.getExpiration()).thenReturn(new Date(System.currentTimeMillis() - 1000L));

        try (MockedStatic<JwtUtil> jwtUtil = Mockito.mockStatic(JwtUtil.class, Mockito.CALLS_REAL_METHODS)) {
            jwtUtil.when(() -> JwtUtil.extractClaims("token")).thenReturn(claims);
            assertTrue(JwtUtil.isTokenExpired("token"));
        }
    }

    @Test
    void isTokenValid_usernameMatchesButExpired_returnsFalse() {
        try (MockedStatic<JwtUtil> jwtUtil = Mockito.mockStatic(JwtUtil.class, Mockito.CALLS_REAL_METHODS)) {
            jwtUtil.when(() -> JwtUtil.extractUsername("token")).thenReturn("alice");
            jwtUtil.when(() -> JwtUtil.isTokenExpired("token")).thenReturn(true);

            assertFalse(JwtUtil.isTokenValid("token", "alice"));
        }
    }
}
