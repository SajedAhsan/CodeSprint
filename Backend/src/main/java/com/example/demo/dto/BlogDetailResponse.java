package com.example.demo.dto;

import java.util.ArrayList;
import java.util.List;

public class BlogDetailResponse {

    private BlogResponse blog;
    private List<CommentResponse> comments = new ArrayList<>();

    public BlogDetailResponse() {
    }

    public BlogDetailResponse(BlogResponse blog, List<CommentResponse> comments) {
        this.blog = blog;
        this.comments = comments != null ? comments : new ArrayList<>();
    }

    public BlogResponse getBlog() {
        return blog;
    }

    public void setBlog(BlogResponse blog) {
        this.blog = blog;
    }

    public List<CommentResponse> getComments() {
        return comments;
    }

    public void setComments(List<CommentResponse> comments) {
        this.comments = comments;
    }
}
