package com.example.demo.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "blog_comment")
public class BlogComment {

    @Id
    @Column(name = "comment_id")
    private Integer commentId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;

    public BlogComment() {
    }

    public BlogComment(Integer commentId, Comment comment, Blog blog) {
        this.commentId = commentId;
        this.comment = comment;
        this.blog = blog;
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

    public Blog getBlog() {
        return blog;
    }

    public void setBlog(Blog blog) {
        this.blog = blog;
    }
}
