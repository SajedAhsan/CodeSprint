package com.example.demo.Controller;

import com.example.demo.Entities.Attachment;
import com.example.demo.Service.AttachmentService;
import com.example.demo.Service.FileStorageService;
import com.example.demo.dto.AttachmentResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final FileStorageService fileStorageService;

    public AttachmentController(AttachmentService attachmentService, FileStorageService fileStorageService) {
        this.attachmentService = attachmentService;
        this.fileStorageService = fileStorageService;
    }

    // ── Upload Endpoints ──────────────────────────────────────────────────────

    @PostMapping("/blog/{blogId}")
    public ResponseEntity<List<AttachmentResponse>> uploadBlogAttachments(
            @PathVariable Integer blogId,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            Authentication auth) {
        requireAuth(auth);
        List<AttachmentResponse> responses = attachmentService.uploadBlogAttachments(blogId, files, auth.getName());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/editorial/{editorialId}")
    public ResponseEntity<List<AttachmentResponse>> uploadEditorialAttachments(
            @PathVariable Integer editorialId,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            Authentication auth) {
        requireAuth(auth);
        List<AttachmentResponse> responses = attachmentService.uploadEditorialAttachments(editorialId, files, auth.getName());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/discussion/{discussionId}")
    public ResponseEntity<List<AttachmentResponse>> uploadDiscussionAttachments(
            @PathVariable Integer discussionId,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            Authentication auth) {
        requireAuth(auth);
        List<AttachmentResponse> responses = attachmentService.uploadDiscussionAttachments(discussionId, files, auth.getName());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/comment/{commentId}")
    public ResponseEntity<List<AttachmentResponse>> uploadCommentAttachments(
            @PathVariable Integer commentId,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            Authentication auth) {
        requireAuth(auth);
        List<AttachmentResponse> responses = attachmentService.uploadCommentAttachments(commentId, files, auth.getName());
        return ResponseEntity.ok(responses);
    }

    // ── Query Endpoints ───────────────────────────────────────────────────────

    @GetMapping("/blog/{blogId}")
    public ResponseEntity<List<AttachmentResponse>> getBlogAttachments(@PathVariable Integer blogId) {
        return ResponseEntity.ok(attachmentService.getAttachmentsForBlog(blogId));
    }

    @GetMapping("/discussion/{discussionId}")
    public ResponseEntity<List<AttachmentResponse>> getDiscussionAttachments(@PathVariable Integer discussionId) {
        return ResponseEntity.ok(attachmentService.getAttachmentsForDiscussion(discussionId));
    }

    @GetMapping("/editorial/{editorialId}")
    public ResponseEntity<List<AttachmentResponse>> getEditorialAttachments(@PathVariable Integer editorialId) {
        return ResponseEntity.ok(attachmentService.getAttachmentsForEditorial(editorialId));
    }

    @GetMapping("/comment/{commentId}")
    public ResponseEntity<List<AttachmentResponse>> getCommentAttachments(@PathVariable Integer commentId) {
        return ResponseEntity.ok(attachmentService.getAttachmentsForComment(commentId));
    }

    // ── File Serving Endpoints ────────────────────────────────────────────────

    /**
     * View a file inline (e.g. images open in browser).
     */
    @GetMapping("/{attachmentId}/view")
    public ResponseEntity<Resource> viewAttachment(@PathVariable Integer attachmentId) {
        Attachment attachment = attachmentService.getAttachmentById(attachmentId);
        String storedFileName = FileStorageService.extractStoredFileName(attachment.getFileUrl());
        Resource resource = fileStorageService.loadFileAsResource(storedFileName);

        String contentType = attachment.getFiletype() != null ? attachment.getFiletype() : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + attachment.getFilename() + "\"")
                .body(resource);
    }

    /**
     * Force-download an attachment by ID. for initial commit
     */
    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Integer attachmentId) {
        Attachment attachment = attachmentService.getAttachmentById(attachmentId);
        String storedFileName = FileStorageService.extractStoredFileName(attachment.getFileUrl());
        Resource resource = fileStorageService.loadFileAsResource(storedFileName);

        String contentType = attachment.getFiletype() != null ? attachment.getFiletype() : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFilename() + "\"")
                .body(resource);
    }

    /**
     * Serve raw file by stored filename (used for inline image previews).
     */
    @GetMapping("/file/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        Resource resource = fileStorageService.loadFileAsResource(filename);

        String contentType = "application/octet-stream";
        String lowerName = filename.toLowerCase();
        if (lowerName.endsWith(".png")) contentType = "image/png";
        else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (lowerName.endsWith(".gif")) contentType = "image/gif";
        else if (lowerName.endsWith(".webp")) contentType = "image/webp";
        else if (lowerName.endsWith(".svg")) contentType = "image/svg+xml";
        else if (lowerName.endsWith(".pdf")) contentType = "application/pdf";
        else if (lowerName.endsWith(".txt") || lowerName.endsWith(".md")) contentType = "text/plain";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    // ── Delete Endpoint ───────────────────────────────────────────────────────

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Integer attachmentId, Authentication auth) {
        requireAuth(auth);
        attachmentService.deleteAttachment(attachmentId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void requireAuth(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
    }
}
