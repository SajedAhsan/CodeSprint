package com.example.demo.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "comment_reaction")
public class CommentReaction {

    @EmbeddedId
    private CommentReactionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("commentId")
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    @Column(name = "liked", nullable = false)
    private Boolean liked = false;

    public CommentReaction() {
    }

    public CommentReaction(CommentReactionId id, User user, Comment comment, Boolean liked) {
        this.id = id;
        this.user = user;
        this.comment = comment;
        this.liked = liked;
    }

    public CommentReactionId getId() {
        return id;
    }

    public void setId(CommentReactionId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Comment getComment() {
        return comment;
    }

    public void setComment(Comment comment) {
        this.comment = comment;
    }

    public Boolean getLiked() {
        return liked;
    }

    public void setLiked(Boolean liked) {
        this.liked = liked;
    }
}
