package com.example.demo.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "discussion_comment")
public class DiscussionComment {

    @Id
    @Column(name = "comment_id")
    private Integer commentId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discussion_id", nullable = false)
    private Discussion discussion;

    public DiscussionComment() {
    }

    public DiscussionComment(
            Integer commentId,
            Comment comment,
            Discussion discussion) {
        this.commentId = commentId;
        this.comment = comment;
        this.discussion = discussion;
    }

    public Integer getCommentId() {
        return commentId;
    }

    public void setCommentId(Integer commentId) {
        this.commentId = commentId;
    }

    public Comment getComment() {
        return comment;
    }

    public void setComment(Comment comment) {
        this.comment = comment;
    }

    public Discussion getDiscussion() {
        return discussion;
    }

    public void setDiscussion(Discussion discussion) {
        this.discussion = discussion;
    }
}