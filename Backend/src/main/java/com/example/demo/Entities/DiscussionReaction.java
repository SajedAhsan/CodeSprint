package com.example.demo.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "discussion_reaction")
public class DiscussionReaction {

    @EmbeddedId
    private DiscussionReactionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("discussionId")
    @JoinColumn(name = "discussion_id", nullable = false)
    private Discussion discussion;

    @Column(name = "liked", nullable = false)
    private Boolean liked = false;

    public DiscussionReaction() {
    }

    public DiscussionReaction(
            DiscussionReactionId id,
            User user,
            Discussion discussion,
            Boolean liked) {
        this.id = id;
        this.user = user;
        this.discussion = discussion;
        this.liked = liked;
    }

    public DiscussionReactionId getId() {
        return id;
    }

    public void setId(DiscussionReactionId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Discussion getDiscussion() {
        return discussion;
    }

    public void setDiscussion(Discussion discussion) {
        this.discussion = discussion;
    }

    public Boolean getLiked() {
        return liked;
    }

    public void setLiked(Boolean liked) {
        this.liked = liked;
    }
}