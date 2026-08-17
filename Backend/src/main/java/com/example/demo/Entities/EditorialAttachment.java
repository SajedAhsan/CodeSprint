package com.example.demo.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "editorial_attachment")
public class EditorialAttachment {

    @Id
    @Column(name = "attachment_id")
    private Integer attachmentId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "attachment_id")
    private Attachment attachment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "editorial_id", nullable = false)
    private Editorial editorial;

    public EditorialAttachment() {
    }

    public EditorialAttachment(Attachment attachment, Editorial editorial) {
        this.attachment = attachment;
        if (attachment != null) {
            this.attachmentId = attachment.getAttachmentId();
        }
        this.editorial = editorial;
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

    public Editorial getEditorial() {
        return editorial;
    }

    public void setEditorial(Editorial editorial) {
        this.editorial = editorial;
    }
}
