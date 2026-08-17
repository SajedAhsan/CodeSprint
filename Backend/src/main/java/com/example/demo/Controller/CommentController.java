package com.example.demo.Controller;

import com.example.demo.Repository.BlogCommentRepository;
import com.example.demo.Repository.DiscussionCommentRepository;
import com.example.demo.Service.BlogService;
import com.example.demo.Service.DiscussionService;
import com.example.demo.dto.CommentReactionResponse;
import com.example.demo.dto.CommentRequest;
import com.example.demo.dto.CommentResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final DiscussionService discussionService;
    private final BlogService blogService;
    private final BlogCommentRepository blogCommentRepository;
    private final DiscussionCommentRepository discussionCommentRepository;

    public CommentController(
            DiscussionService discussionService,
            BlogService blogService,
            BlogCommentRepository blogCommentRepository,
            DiscussionCommentRepository discussionCommentRepository) {
        this.discussionService = discussionService;
        this.blogService = blogService;
        this.blogCommentRepository = blogCommentRepository;
        this.discussionCommentRepository = discussionCommentRepository;
    }

    private String requireAuthenticatedUsername(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        return authentication.getName();
    }

    @PostMapping("/{commentId}/replies")
    public ResponseEntity<CommentResponse> replyToComment(
            @PathVariable Integer commentId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);

        if (blogCommentRepository.findByComment_CommentId(commentId).isPresent()) {
            CommentResponse response = blogService.replyToComment(commentId, request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }

        if (discussionCommentRepository.findByComment_CommentId(commentId).isPresent()) {
            CommentResponse response = discussionService.replyToComment(commentId, request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found with id: " + commentId);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Integer commentId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);

        if (blogCommentRepository.findByComment_CommentId(commentId).isPresent()) {
            CommentResponse response = blogService.updateComment(commentId, request, username);
            return ResponseEntity.ok(response);
        }

        CommentResponse response = discussionService.updateComment(commentId, request, username);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Integer commentId,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);

        if (blogCommentRepository.findByComment_CommentId(commentId).isPresent()) {
            blogService.deleteComment(commentId, username);
            return ResponseEntity.noContent().build();
        }

        discussionService.deleteComment(commentId, username);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{commentId}/react")
    public ResponseEntity<CommentReactionResponse> toggleCommentReaction(
            @PathVariable Integer commentId,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);
        CommentReactionResponse response = blogService.toggleCommentReaction(commentId, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<CommentReactionResponse> likeComment(
            @PathVariable Integer commentId,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);
        CommentReactionResponse response = blogService.toggleCommentReaction(commentId, username);
        return ResponseEntity.ok(response);
    }
}
