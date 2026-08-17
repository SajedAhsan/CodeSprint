package com.example.demo.dto;

public class CommentReactionResponse {

    private Integer commentId;
    private Long likeCount;
    private Boolean isLiked;

    public CommentReactionResponse() {
    }

    public CommentReactionResponse(Integer commentId, Long likeCount, Boolean isLiked) {
        this.commentId = commentId;
        this.likeCount = likeCount != null ? likeCount : 0L;
        this.isLiked = isLiked != null ? isLiked : false;
    }

    public Integer getCommentId() {
        return commentId;
    }

    public void setCommentId(Integer commentId) {
        this.commentId = commentId;
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
