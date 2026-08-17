package com.example.demo.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "comment_attachment")
public class CommentAttachment {

    @Id
    @Column(name = "attachment_id")
    private Integer attachmentId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "attachment_id")
    private Attachment attachment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    public CommentAttachment() {
    }

    public CommentAttachment(Attachment attachment, Comment comment) {
        this.attachment = attachment;
        if (attachment != null) {
            this.attachmentId = attachment.getAttachmentId();
        }
        this.comment = comment;
    }

    public Integer getAttachmentId() {
        return attachmentId;
    }

    public void setAttachmentId(Integer attachmentId) {
        this.attachmentId = attachmentId;
    }

    public Attachment getAttachment() {
        return attachment;
    }

    public void setAttachment(Attachment attachment) {
        this.attachment = attachment;
        if (attachment != null) {
            this.attachmentId = attachment.getAttachmentId();
        }
    }

    public Comment getComment() {
        return comment;
    }

    public void setComment(Comment comment) {
        this.comment = comment;
    }
}
