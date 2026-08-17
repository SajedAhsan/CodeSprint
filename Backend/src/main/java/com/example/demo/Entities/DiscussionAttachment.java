package com.example.demo.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "discussion_attachment")
public class DiscussionAttachment {

    @Id
    @Column(name = "attachment_id")
    private Integer attachmentId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "attachment_id")
    private Attachment attachment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discussion_id", nullable = false)
    private Discussion discussion;

    public DiscussionAttachment() {
    }

    public DiscussionAttachment(Attachment attachment, Discussion discussion) {
        this.attachment = attachment;
        if (attachment != null) {
            this.attachmentId = attachment.getAttachmentId();
        }
        this.discussion = discussion;
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

    public Discussion getDiscussion() {
        return discussion;
    }

    public void setDiscussion(Discussion discussion) {
        this.discussion = discussion;
    }
}
