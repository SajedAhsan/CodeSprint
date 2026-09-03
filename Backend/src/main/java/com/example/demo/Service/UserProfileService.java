package com.example.demo.Service;

import com.example.demo.Repository.UserProfileRepository;
import com.example.demo.dto.UserProfileDto;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    public UserProfileService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public UserProfileDto getProfile(String identifier) {
        if (identifier != null && !identifier.isBlank()) {
            String trimmed = identifier.trim();

            // Check if identifier is numeric userId
            if (trimmed.matches("^\\d+$")) {
                try {
                    int userId = Integer.parseInt(trimmed);
                    return userProfileRepository.findProfileByUserId(userId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
                } catch (NumberFormatException ignored) {
                }
            }

            // Otherwise treat as username
            return userProfileRepository.findProfileByUsername(trimmed)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        }

        // Try authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String username = auth.getName();
            return userProfileRepository.findProfileByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User identifier or authentication required");
    }

    public UserProfileDto getProfileByUserId(Integer userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required");
        }
        return userProfileRepository.findProfileByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
