package com.example.demo.Service;

import com.example.demo.Entities.*;
import com.example.demo.Repository.*;
import com.example.demo.dto.AttachmentResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final AttachmentJdbcRepository attachmentJdbcRepository;
    private final BlogRepository blogRepository;
    private final EditorialRepository editorialRepository;
    private final CommentRepository commentRepository;
    private final DiscussionRepository discussionRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public AttachmentService(
            AttachmentRepository attachmentRepository,
            AttachmentJdbcRepository attachmentJdbcRepository,
            BlogRepository blogRepository,
            EditorialRepository editorialRepository,
            CommentRepository commentRepository,
            DiscussionRepository discussionRepository,
            UserRepository userRepository,
            FileStorageService fileStorageService) {
        this.attachmentRepository = attachmentRepository;
        this.attachmentJdbcRepository = attachmentJdbcRepository;
        this.blogRepository = blogRepository;
        this.editorialRepository = editorialRepository;
        this.commentRepository = commentRepository;
        this.discussionRepository = discussionRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    private User getAuthenticatedUser(String username) {
        if (username == null || username.isBlank() || "anonymousUser".equalsIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        return userRepository.findUserByUsername(username.trim())
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    private boolean isAdmin(User user) {
        return user != null && user.getRole() != null && user.getRole().toUpperCase().contains("ADMIN");
    }

    @Transactional
    public List<AttachmentResponse> uploadBlogAttachments(Integer blogId, MultipartFile[] files, String username) {
        User user = getAuthenticatedUser(username);
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found with id: " + blogId));

        if (!blog.getUser().getUserId().equals(user.getUserId()) && !isAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have permission to attach files to this blog");
        }

        if (files == null || files.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No files provided for upload");
        }

        List<AttachmentResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty())
                continue;

            FileStorageService.StoredFileInfo info = fileStorageService.storeFile(file);

            Attachment attachment = new Attachment();
            attachment.setUser(user);
            attachment.setFilename(info.getOriginalFilename());
            attachment.setFiletype(info.getContentType());
            attachment.setFileUrl(info.getFileUrl());
            attachment.setUploadedAt(LocalDateTime.now());

            Attachment savedAttachment = attachmentRepository.saveAndFlush(attachment);
            attachmentJdbcRepository.linkAttachmentToBlog(savedAttachment.getAttachmentId(), blog.getBlogId());

            responses.add(toResponse(savedAttachment));
        }

        return responses;
    }

    @Transactional
    public List<AttachmentResponse> uploadDiscussionAttachments(Integer discussionId, MultipartFile[] files,
            String username) {
        User user = getAuthenticatedUser(username);
        Discussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Discussion not found with id: " + discussionId));

        if (!discussion.getUser().getUserId().equals(user.getUserId()) && !isAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have permission to attach files to this discussion");
        }

        if (files == null || files.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No files provided for upload");
        }

        List<AttachmentResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty())
                continue;

            FileStorageService.StoredFileInfo info = fileStorageService.storeFile(file);

            Attachment attachment = new Attachment();
            attachment.setUser(user);
            attachment.setFilename(info.getOriginalFilename());
            attachment.setFiletype(info.getContentType());
            attachment.setFileUrl(info.getFileUrl());
            attachment.setUploadedAt(LocalDateTime.now());

            Attachment savedAttachment = attachmentRepository.saveAndFlush(attachment);
            attachmentJdbcRepository.linkAttachmentToDiscussion(savedAttachment.getAttachmentId(),
                    discussion.getDiscussionId());

            responses.add(toResponse(savedAttachment));
        }

        return responses;
    }

    @Transactional
    public List<AttachmentResponse> uploadEditorialAttachments(Integer editorialId, MultipartFile[] files,
            String username) {
        User user = getAuthenticatedUser(username);
        Editorial editorial = editorialRepository.findById(editorialId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Editorial not found with id: " + editorialId));

        if (!isAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only administrators can attach files to editorials");
        }

        if (files == null || files.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No files provided for upload");
        }

        List<AttachmentResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty())
                continue;

            FileStorageService.StoredFileInfo info = fileStorageService.storeFile(file);

            Attachment attachment = new Attachment();
            attachment.setUser(user);
            attachment.setFilename(info.getOriginalFilename());
            attachment.setFiletype(info.getContentType());
            attachment.setFileUrl(info.getFileUrl());
            attachment.setUploadedAt(LocalDateTime.now());

            Attachment savedAttachment = attachmentRepository.saveAndFlush(attachment);
            attachmentJdbcRepository.linkAttachmentToEditorial(savedAttachment.getAttachmentId(),
                    editorial.getEditorialId());

            responses.add(toResponse(savedAttachment));
        }

        return responses;
    }

    @Transactional
    public List<AttachmentResponse> uploadCommentAttachments(Integer commentId, MultipartFile[] files,
            String username) {
        User user = getAuthenticatedUser(username);
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Comment not found with id: " + commentId));

        if (!comment.getUser().getUserId().equals(user.getUserId()) && !isAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have permission to attach files to this comment");
        }

        if (files == null || files.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No files provided for upload");
        }

        List<AttachmentResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty())
                continue;

            FileStorageService.StoredFileInfo info = fileStorageService.storeFile(file);

            Attachment attachment = new Attachment();
            attachment.setUser(user);
            attachment.setFilename(info.getOriginalFilename());
            attachment.setFiletype(info.getContentType());
            attachment.setFileUrl(info.getFileUrl());
            attachment.setUploadedAt(LocalDateTime.now());

            Attachment savedAttachment = attachmentRepository.saveAndFlush(attachment);
            attachmentJdbcRepository.linkAttachmentToComment(savedAttachment.getAttachmentId(), comment.getCommentId());

            responses.add(toResponse(savedAttachment));
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsForBlog(Integer blogId) {
        return attachmentJdbcRepository.findAttachmentsByBlogId(blogId);
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsForDiscussion(Integer discussionId) {
        return attachmentJdbcRepository.findAttachmentsByDiscussionId(discussionId);
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsForEditorial(Integer editorialId) {
        return attachmentJdbcRepository.findAttachmentsByEditorialId(editorialId);
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsForComment(Integer commentId) {
        return attachmentJdbcRepository.findAttachmentsByCommentId(commentId);
    }

    @Transactional(readOnly = true)
    public Attachment getAttachmentById(Integer attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Attachment not found with id: " + attachmentId));
    }

    @Transactional
    public void deleteAttachment(Integer attachmentId, String username) {
        User user = getAuthenticatedUser(username);
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Attachment not found with id: " + attachmentId));

        boolean isOwner = attachment.getUser().getUserId().equals(user.getUserId());
        if (!isOwner && !isAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have permission to delete this attachment");
        }

        attachmentJdbcRepository.deleteLinksByAttachmentId(attachmentId);
        String storedFileName = FileStorageService.extractStoredFileName(attachment.getFileUrl());
        fileStorageService.deleteFile(storedFileName);
        attachmentRepository.delete(attachment);
    }

    public AttachmentResponse toResponse(Attachment a) {
        if (a == null)
            return null;
        return new AttachmentResponse(
                a.getAttachmentId(),
                a.getUser() != null ? a.getUser().getUserId() : null,
                a.getUser() != null ? a.getUser().getUsername() : null,
                a.getFilename(),
                a.getFiletype(),
                a.getFileUrl(),
                "/api/attachments/" + a.getAttachmentId() + "/download",
                a.getUploadedAt());
    }
}
