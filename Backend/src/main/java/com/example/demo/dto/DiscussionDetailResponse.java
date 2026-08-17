package com.example.demo.dto;

import java.util.ArrayList;
import java.util.List;

public class DiscussionDetailResponse {

    private DiscussionResponse discussion;
    private List<CommentResponse> comments = new ArrayList<>();

    public DiscussionDetailResponse() {
    }

    public DiscussionDetailResponse(DiscussionResponse discussion, List<CommentResponse> comments) {
        this.discussion = discussion;
        this.comments = comments != null ? comments : new ArrayList<>();
    }

    public DiscussionResponse getDiscussion() {
        return discussion;
    }

    public void setDiscussion(DiscussionResponse discussion) {
        this.discussion = discussion;
    }

    public List<CommentResponse> getComments() {
        return comments;
    }

    public void setComments(List<CommentResponse> comments) {
        this.comments = comments;
    }
}
