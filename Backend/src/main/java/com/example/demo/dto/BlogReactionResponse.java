package com.example.demo.dto;

public class BlogReactionResponse {

    private Integer blogId;
    private Long likeCount;
    private Boolean isLiked;

    public BlogReactionResponse() {
    }

    public BlogReactionResponse(Integer blogId, Long likeCount, Boolean isLiked) {
        this.blogId = blogId;
        this.likeCount = likeCount != null ? likeCount : 0L;
        this.isLiked = isLiked != null ? isLiked : false;
    }

    public Integer getBlogId() {
        return blogId;
    }

    public void setBlogId(Integer blogId) {
        this.blogId = blogId;
    }

    public Long getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(Long likeCount) {
        this.likeCount = likeCount;
    }

    public Boolean getIsLiked() {
        return isLiked;
    }

    public void setIsLiked(Boolean isLiked) {
        this.isLiked = isLiked;
    }
}
