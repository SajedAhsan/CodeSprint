package com.example.demo.Entities;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class BlogReactionId implements Serializable {

    private Integer userId;
    private Integer blogId;

    public BlogReactionId() {
    }

    public BlogReactionId(Integer userId, Integer blogId) {
        this.userId = userId;
        this.blogId = blogId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getBlogId() {
        return blogId;
    }

    public void setBlogId(Integer blogId) {
        this.blogId = blogId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof BlogReactionId)) {
            return false;
        }
        BlogReactionId that = (BlogReactionId) o;
        return Objects.equals(userId, that.userId)
                && Objects.equals(blogId, that.blogId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, blogId);
    }
}
