package com.example.demo.dto;

public class DiscussionReactionResponse {

    private Integer discussionId;
    private Long likeCount;
    private Boolean isLiked;

    public DiscussionReactionResponse() {
    }

    public DiscussionReactionResponse(Integer discussionId, Long likeCount, Boolean isLiked) {
        this.discussionId = discussionId;
        this.likeCount = likeCount;
        this.isLiked = isLiked;
    }

    public Integer getDiscussionId() {
        return discussionId;
    }

    public void setDiscussionId(Integer discussionId) {
        this.discussionId = discussionId;
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
