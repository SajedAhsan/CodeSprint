package com.example.demo.Controller;

import com.example.demo.Service.BlogService;
import com.example.demo.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    private final BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
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

    @PostMapping
    public ResponseEntity<BlogResponse> createBlog(
            @Valid @RequestBody BlogRequest request,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);
        BlogResponse response = blogService.createBlog(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<BlogResponse>> getAllBlogs(Authentication authentication) {
        String username = getUsername(authentication);
        List<BlogResponse> blogs = blogService.getAllBlogs(username);
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/{blogId}")
    public ResponseEntity<BlogDetailResponse> getBlogById(
            @PathVariable Integer blogId,
            Authentication authentication) {
        String username = getUsername(authentication);
        BlogDetailResponse response = blogService.getBlogById(blogId, username);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{blogId}")
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable Integer blogId,
            @Valid @RequestBody BlogRequest request,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);
        BlogResponse response = blogService.updateBlog(blogId, request, username);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{blogId}")
    public ResponseEntity<Void> deleteBlog(
            @PathVariable Integer blogId,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);
        blogService.deleteBlog(blogId, username);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{blogId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Integer blogId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);
        CommentResponse response = blogService.addComment(blogId, request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{blogId}/comments")
    public ResponseEntity<List<CommentResponse>> getCommentsByBlog(
            @PathVariable Integer blogId,
            Authentication authentication) {
        String username = getUsername(authentication);
        List<CommentResponse> comments = blogService.getCommentsByBlog(blogId, username);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/{blogId}/react")
    public ResponseEntity<BlogReactionResponse> toggleReaction(
            @PathVariable Integer blogId,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);
        BlogReactionResponse response = blogService.toggleBlogReaction(blogId, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{blogId}/like")
    public ResponseEntity<BlogReactionResponse> likeBlog(
            @PathVariable Integer blogId,
            Authentication authentication) {
        String username = requireAuthenticatedUsername(authentication);
        BlogReactionResponse response = blogService.toggleBlogReaction(blogId, username);
        return ResponseEntity.ok(response);
    }
}
