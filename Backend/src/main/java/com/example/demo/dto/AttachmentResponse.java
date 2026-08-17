package com.example.demo.dto;

import java.time.LocalDateTime;

public class AttachmentResponse {

    private Integer attachmentId;
    private Integer userId;
    private String authorUsername;
    private String filename;
    private String filetype;
    private String fileUrl;
    private String downloadUrl;
    private LocalDateTime uploadedAt;

    public AttachmentResponse() {
    }

    public AttachmentResponse(Integer attachmentId, Integer userId, String authorUsername,
                              String filename, String filetype, String fileUrl,
                              String downloadUrl, LocalDateTime uploadedAt) {
        this.attachmentId = attachmentId;
        this.userId = userId;
        this.authorUsername = authorUsername;
        this.filename = filename;
        this.filetype = filetype;
        this.fileUrl = fileUrl;
        this.downloadUrl = downloadUrl;
        this.uploadedAt = uploadedAt;
    }

    public Integer getAttachmentId() {
        return attachmentId;
    }

    public void setAttachmentId(Integer attachmentId) {
        this.attachmentId = attachmentId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public void setAuthorUsername(String authorUsername) {
        this.authorUsername = authorUsername;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getFiletype() {
        return filetype;
    }

    public void setFiletype(String filetype) {
        this.filetype = filetype;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
