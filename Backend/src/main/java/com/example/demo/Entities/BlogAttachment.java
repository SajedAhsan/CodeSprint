package com.example.demo.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "blog_attachment")
public class BlogAttachment {

    @Id
    @Column(name = "attachment_id")
    private Integer attachmentId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "attachment_id")
    private Attachment attachment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;

    public BlogAttachment() {
    }

    public BlogAttachment(Attachment attachment, Blog blog) {
        this.attachment = attachment;
        if (attachment != null) {
            this.attachmentId = attachment.getAttachmentId();
        }
        this.blog = blog;
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

    public Blog getBlog() {
        return blog;
    }

    public void setBlog(Blog blog) {
        this.blog = blog;
    }
}
