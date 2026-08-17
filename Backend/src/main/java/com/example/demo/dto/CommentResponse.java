package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CommentResponse {

    private Integer commentId;
    private Integer discussionId;
    private Integer blogId;
    private String content;
    private Integer authorId;
    private String authorUsername;
    private Integer parentCommentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long likeCount = 0L;
    private Boolean isLikedByCurrentUser = false;
    private List<CommentResponse> replies = new ArrayList<>();
    private List<AttachmentResponse> attachments = new ArrayList<>();

    public CommentResponse() {
    }

    public CommentResponse(Integer commentId, Integer discussionId, String content,
                           Integer authorId, String authorUsername, Integer parentCommentId,
                           LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.commentId = commentId;
        this.discussionId = discussionId;
        this.content = content;
        this.authorId = authorId;
        this.authorUsername = authorUsername;
        this.parentCommentId = parentCommentId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.likeCount = 0L;
        this.isLikedByCurrentUser = false;
        this.replies = new ArrayList<>();
    }

    public CommentResponse(Integer commentId, Integer discussionId, Integer blogId, String content,
                           Integer authorId, String authorUsername, Integer parentCommentId,
                           LocalDateTime createdAt, LocalDateTime updatedAt,
                           Long likeCount, Boolean isLikedByCurrentUser) {
        this.commentId = commentId;
        this.discussionId = discussionId;
        this.blogId = blogId;
        this.content = content;
        this.authorId = authorId;
        this.authorUsername = authorUsername;
        this.parentCommentId = parentCommentId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.likeCount = likeCount != null ? likeCount : 0L;
        this.isLikedByCurrentUser = isLikedByCurrentUser != null ? isLikedByCurrentUser : false;
        this.replies = new ArrayList<>();
    }

    public Integer getCommentId() {
        return commentId;
    }

    public void setCommentId(Integer commentId) {
        this.commentId = commentId;
    }

    public Integer getDiscussionId() {
        return discussionId;
    }

    public void setDiscussionId(Integer discussionId) {
        this.discussionId = discussionId;
    }

    public Integer getBlogId() {
        return blogId;
    }

    public void setBlogId(Integer blogId) {
        this.blogId = blogId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Integer authorId) {
        this.authorId = authorId;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public void setAuthorUsername(String authorUsername) {
        this.authorUsername = authorUsername;
    }

    public Integer getParentCommentId() {
        return parentCommentId;
    }

    public void setParentCommentId(Integer parentCommentId) {
        this.parentCommentId = parentCommentId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(Long likeCount) {
        this.likeCount = likeCount;
    }

    public Boolean getIsLikedByCurrentUser() {
        return isLikedByCurrentUser;
    }

    public void setIsLikedByCurrentUser(Boolean isLikedByCurrentUser) {
        this.isLikedByCurrentUser = isLikedByCurrentUser;
    }

    public List<CommentResponse> getReplies() {
        return replies;
    }

    public void setReplies(List<CommentResponse> replies) {
        this.replies = replies;
    }

    public List<AttachmentResponse> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<AttachmentResponse> attachments) {
        this.attachments = attachments != null ? attachments : new ArrayList<>();
    }
}
