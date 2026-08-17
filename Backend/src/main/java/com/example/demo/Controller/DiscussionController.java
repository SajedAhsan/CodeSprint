package com.example.demo.Controller;

import com.example.demo.Service.DiscussionService;
import com.example.demo.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/discussions")
public class DiscussionController {

    private final DiscussionService discussionService;

    public DiscussionController(DiscussionService discussionService) {
        this.discussionService = discussionService;
    }

    private String getUsername(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return authentication.getName();
    }

    private String requireAuthenticatedUsername(Authentication authentication) {
        String username = getUsername(authentication);
        if (username == null || "anonymousUser".equalsIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        return username;
    }

    @PostMapping("/problem/{problemId}")
    public ResponseEntity<DiscussionResponse> createDiscussion(
            @PathVariable Integer problemId,
            @Valid @RequestBody DiscussionRequest request,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);
        DiscussionResponse response = discussionService.createDiscussion(problemId, request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping
    public ResponseEntity<DiscussionResponse> createDiscussionGeneric(
            @Valid @RequestBody DiscussionRequest request,
            Authentication authentication) {
        if (request.getProblemId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "problemId is required in request body");
        }
        String username = requireAuthenticatedUsername(authentication);
        DiscussionResponse response = discussionService.createDiscussion(request.getProblemId(), request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/problem/{problemId}")
    public ResponseEntity<?> getDiscussionsByProblem(
            @PathVariable Integer problemId,
            @RequestParam(name = "details", defaultValue = "false") boolean details,
            Authentication authentication) {
        String username = getUsername(authentication);
        if (details) {
            List<DiscussionDetailResponse> responses = discussionService.getDiscussionsWithDetailsByProblem(problemId, username);
            return ResponseEntity.ok(responses);
        }
        List<DiscussionResponse> responses = discussionService.getDiscussionsByProblem(problemId, username);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/problem/{problemId}/details")
    public ResponseEntity<List<DiscussionDetailResponse>> getDiscussionsWithDetailsByProblem(
            @PathVariable Integer problemId,
            Authentication authentication) {
        String username = getUsername(authentication);
        List<DiscussionDetailResponse> responses = discussionService.getDiscussionsWithDetailsByProblem(problemId, username);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{discussionId}")
    public ResponseEntity<DiscussionDetailResponse> getDiscussionById(
            @PathVariable Integer discussionId,
            Authentication authentication) {
        String username = getUsername(authentication);
        DiscussionDetailResponse response = discussionService.getDiscussionById(discussionId, username);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{discussionId}")
    public ResponseEntity<DiscussionResponse> updateDiscussion(
            @PathVariable Integer discussionId,
            @Valid @RequestBody DiscussionRequest request,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);
        DiscussionResponse response = discussionService.updateDiscussion(discussionId, request, username);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{discussionId}")
    public ResponseEntity<Void> deleteDiscussion(
            @PathVariable Integer discussionId,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);
        discussionService.deleteDiscussion(discussionId, username);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{discussionId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Integer discussionId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);
        CommentResponse response = discussionService.addComment(discussionId, request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{discussionId}/react")
    public ResponseEntity<DiscussionReactionResponse> toggleReaction(
            @PathVariable Integer discussionId,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);
        DiscussionReactionResponse response = discussionService.toggleReaction(discussionId, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{discussionId}/like")
    public ResponseEntity<DiscussionReactionResponse> likeDiscussion(
            @PathVariable Integer discussionId,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);
        DiscussionReactionResponse response = discussionService.toggleReaction(discussionId, username);
        return ResponseEntity.ok(response);
    }
}
