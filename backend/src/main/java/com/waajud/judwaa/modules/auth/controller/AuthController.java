package com.waajud.judwaa.modules.auth.controller;

import com.waajud.judwaa.modules.auth.dto.request.*;
import com.waajud.judwaa.modules.auth.dto.response.*;
import com.waajud.judwaa.modules.auth.entity.*;
import com.waajud.judwaa.modules.auth.jwt.JwtUtil;
import com.waajud.judwaa.modules.auth.service.*;
import com.waajud.judwaa.shared.JudwaaResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Authentication", description = "Endpoints for login and registration")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
	@Autowired
	private AuthenticationManager authenticationManager;
	@Autowired
	private UserService userService;
	@Autowired
	private PasswordEncoder passwordEncoder;
	@Autowired
	private TokenBlacklistService tokenBlacklistService;

	@Operation(summary = "Authenticate user and get JWT token", description = "Returns a JWT token if credentials are valid.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = AuthRequestDTO.class))), responses = {
			@ApiResponse(responseCode = "200", description = "JWT token returned"),
			@ApiResponse(responseCode = "401", description = "Invalid credentials")})
	@PostMapping("/login")
	public JudwaaResponse<AuthResponseDTO, String> login(@RequestBody @Valid AuthRequestDTO request) {
		Authentication authentication = authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
		UserDetails userDetails = (UserDetails) authentication.getPrincipal();
		Set<String> roles = userDetails.getAuthorities().stream().map(authority -> authority.getAuthority())
				.collect(Collectors.toSet());
		String token = JwtUtil.generateToken(userDetails.getUsername(), roles);
		return JudwaaResponse.build(new AuthResponseDTO(token), HttpStatus.OK.getReasonPhrase(), HttpStatus.OK);
	}

	@Operation(summary = "Register a new user", description = "Creates a new user account.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = RegisterRequestDTO.class))), responses = {
			@ApiResponse(responseCode = "200", description = "User registered successfully"),
			@ApiResponse(responseCode = "400", description = "Username already exists")})
	@PostMapping("/register")
	public JudwaaResponse<Object, String> register(@RequestBody @Valid RegisterRequestDTO request) {
		if (userService.existsByUsername(request.getUsername())) {
			return JudwaaResponse.build(null, "Username already exists", HttpStatus.BAD_REQUEST);
		}
		User user = new User();
		user.setUsername(request.getUsername());
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		userService.save(user);
		return JudwaaResponse.build(null, "User registered successfully", HttpStatus.OK);
	}

	@Operation(summary = "Logout user", description = "Blacklists the current JWT and clears the current security context.", responses = {
			@ApiResponse(responseCode = "200", description = "User logged out successfully"),
			@ApiResponse(responseCode = "400", description = "Invalid or missing token")})
	@PostMapping("/logout")
	public JudwaaResponse<Object, String> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
		String token = extractBearerToken(authHeader);
		if (token == null) {
			return JudwaaResponse.build(
					null,
					"Authorization header with Bearer token is required",
					HttpStatus.BAD_REQUEST
			);
		}

		try {
			tokenBlacklistService.blacklistToken(token);
			SecurityContextHolder.clearContext();
			return JudwaaResponse.build(null, "User logged out successfully", HttpStatus.OK);
		} catch (Exception ex) {
			return JudwaaResponse.build(null, "Invalid token", HttpStatus.BAD_REQUEST);
		}
	}

	@Operation(summary = "Force logout token", description = "Admin-only endpoint to blacklist any JWT token.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = ForceLogoutRequestDTO.class))), responses = {
			@ApiResponse(responseCode = "200", description = "Token forcefully logged out successfully"),
			@ApiResponse(responseCode = "400", description = "Invalid token"),
			@ApiResponse(responseCode = "403", description = "Forbidden")})
	@PostMapping("/force-logout")
	public JudwaaResponse<Object, String> forceLogout(@RequestBody @Valid ForceLogoutRequestDTO request,
			Authentication authentication) {
		boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
				.anyMatch(authority -> "ADMIN".equals(authority.getAuthority()));
		if (!isAdmin) {
			return JudwaaResponse.build(null, "Only admin can force logout tokens", HttpStatus.FORBIDDEN);
		}

		String token = normalizeToken(request.getToken());
		if (token == null) {
			return JudwaaResponse.build(null, "Token is required", HttpStatus.BAD_REQUEST);
		}

		try {
			tokenBlacklistService.blacklistToken(token);
			return JudwaaResponse.build(null, "Token forcefully logged out successfully", HttpStatus.OK);
		} catch (Exception ex) {
			return JudwaaResponse.build(null, "Invalid token", HttpStatus.BAD_REQUEST);
		}
	}

	private String extractBearerToken(String authHeader) {
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			return null;
		}

		String token = authHeader.substring(7).trim();
		return token.isEmpty() ? null : token;
	}

	private String normalizeToken(String token) {
		if (token == null) {
			return null;
		}

		String normalized = token.trim();
		if (normalized.startsWith("Bearer ")) {
			normalized = normalized.substring(7).trim();
		}

		return normalized.isEmpty() ? null : normalized;
	}
}
