package com.waajud.judwaa.modules.auth.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.util.Set;
import javax.crypto.SecretKey;

public class JwtUtil {
	private static final SecretKey SECRET_KEY = Keys
			.hmacShaKeyFor("my-super-secret-key-which-should-be-longer".getBytes());
	private static final long EXPIRATION = 1000 * 60 * 60 * 10; // 10 hours

	public static String generateToken(String username, Set<String> roles) {
		return Jwts.builder().subject(username).claim("roles", roles).issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + EXPIRATION)).signWith(SECRET_KEY).compact();
	}

	public static Claims extractClaims(String token) {
		Jws<Claims> jws = Jwts.parser().verifyWith(SECRET_KEY).build().parseSignedClaims(token);
		return jws.getPayload();
	}

	public static String extractUsername(String token) {
		return extractClaims(token).getSubject();
	}

	public static boolean isTokenValid(String token, String username) {
		final String extractedUsername = extractUsername(token);
		return (extractedUsername.equals(username) && !isTokenExpired(token));
	}

	public static boolean isTokenExpired(String token) {
		return extractClaims(token).getExpiration().before(new Date());
	}
}
