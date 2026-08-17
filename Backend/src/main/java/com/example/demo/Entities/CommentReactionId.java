package com.example.demo.Entities;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class CommentReactionId implements Serializable {

    private Integer userId;
    private Integer commentId;

    public CommentReactionId() {
    }

    public CommentReactionId(Integer userId, Integer commentId) {
        this.userId = userId;
        this.commentId = commentId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getCommentId() {
        return commentId;
    }

    public void setCommentId(Integer commentId) {
        this.commentId = commentId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CommentReactionId)) {
            return false;
        }
        CommentReactionId that = (CommentReactionId) o;
        return Objects.equals(userId, that.userId)
                && Objects.equals(commentId, that.commentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, commentId);
    }
}
