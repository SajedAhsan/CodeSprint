package com.example.demo.Service;

import com.example.demo.Entities.User;
import com.example.demo.Repository.UserRepository;
import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.security.JwtService;
import com.example.demo.security.TokenBlacklistService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, TokenBlacklistService tokenBlacklistService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.countUsersByUsername(request.getUsername().trim()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setIsPremium(false);

        User savedUser = userRepository.save(user);

        return new AuthResponse(
                "Registration successful",
                null,
            savedUser.getUserId(),
            savedUser.getUsername());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findUserByUsername(request.getUsername().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                "Login successful",
                token,
            user.getUserId(),
            user.getUsername());
    }

    /**
     * Invalidates the supplied JWT token so that it cannot be reused
     * even before it naturally expires.
     *
     * @param token raw JWT value extracted from the Authorization header
     */
    public void logout(String token) {
        if (token != null && !token.isBlank()) {
            tokenBlacklistService.blacklist(token);
        }
    }
}