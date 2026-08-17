package com.example.demo.Entities;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class DiscussionReactionId implements Serializable {

    private Integer userId;
    private Integer discussionId;

    public DiscussionReactionId() {
    }

    public DiscussionReactionId(Integer userId, Integer discussionId) {
        this.userId = userId;
        this.discussionId = discussionId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getDiscussionId() {
        return discussionId;
    }

    public void setDiscussionId(Integer discussionId) {
        this.discussionId = discussionId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }

        if (!(o instanceof DiscussionReactionId)) {
            return false;
        }

        DiscussionReactionId that = (DiscussionReactionId) o;

        return Objects.equals(userId, that.userId)
                && Objects.equals(discussionId, that.discussionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, discussionId);
    }
}