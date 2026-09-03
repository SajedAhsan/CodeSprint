package com.example.demo.Controller;

import com.example.demo.Service.UserProfileService;
import com.example.demo.dto.UserProfileDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserProfileService userProfileService;

    public UserController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(
            @RequestParam(value = "userId", required = false) String userId,
            @RequestParam(value = "username", required = false) String username
    ) {
        String identifier = userId != null && !userId.isBlank() ? userId : username;
        return ResponseEntity.ok(userProfileService.getProfile(identifier));
    }

    @GetMapping("/profile/{identifier}")
    public ResponseEntity<UserProfileDto> getProfileByIdentifier(@PathVariable String identifier) {
        return ResponseEntity.ok(userProfileService.getProfile(identifier));
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfileDto> getProfileByUserId(@PathVariable Integer userId) {
        return ResponseEntity.ok(userProfileService.getProfileByUserId(userId));
    }
}
