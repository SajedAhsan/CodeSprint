package com.example.demo.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "blog_reaction")
public class BlogReaction {

    @EmbeddedId
    private BlogReactionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("blogId")
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;

    @Column(name = "liked", nullable = false)
    private Boolean liked = false;

    public BlogReaction() {
    }

    public BlogReaction(BlogReactionId id, User user, Blog blog, Boolean liked) {
        this.id = id;
        this.user = user;
        this.blog = blog;
        this.liked = liked;
    }

    public BlogReactionId getId() {
        return id;
    }

    public void setId(BlogReactionId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Blog getBlog() {
        return blog;
    }

    public void setBlog(Blog blog) {
        this.blog = blog;
    }

    public Boolean getLiked() {
        return liked;
    }

    public void setLiked(Boolean liked) {
        this.liked = liked;
    }
}
