package com.waajud.judwaa.modules.auth.controller;

import com.waajud.judwaa.modules.auth.dto.request.*;
import com.waajud.judwaa.modules.auth.dto.response.*;
import com.waajud.judwaa.modules.auth.entity.*;
import com.waajud.judwaa.modules.auth.jwt.JwtUtil;
import com.waajud.judwaa.modules.auth.service.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

	@Operation(summary = "Authenticate user and get JWT token", description = "Returns a JWT token if credentials are valid.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = AuthRequestDTO.class))), responses = {
			@ApiResponse(responseCode = "200", description = "JWT token returned"),
			@ApiResponse(responseCode = "401", description = "Invalid credentials")})
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody @Valid AuthRequestDTO request) {
		Authentication authentication = authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
		UserDetails userDetails = (UserDetails) authentication.getPrincipal();
		Set<String> roles = userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority)
				.collect(Collectors.toSet());
		String token = JwtUtil.generateToken(userDetails.getUsername(), roles);
		return ResponseEntity.ok(new AuthResponseDTO(token));
	}

	@Operation(summary = "Register a new user", description = "Creates a new user account.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = RegisterRequestDTO.class))), responses = {
			@ApiResponse(responseCode = "200", description = "User registered successfully"),
			@ApiResponse(responseCode = "400", description = "Username already exists")})
	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody @Valid RegisterRequestDTO request) {
		if (userService.existsByUsername(request.getUsername())) {
			return ResponseEntity.badRequest().body("Username already exists");
		}
		User user = new User();
		user.setUsername(request.getUsername());
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		userService.save(user);
		return ResponseEntity.ok("User registered successfully");
	}
}
