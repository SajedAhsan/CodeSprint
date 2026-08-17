package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public class DiscussionRequest {

    @NotBlank(message = "Content cannot be empty")
    private String content;

    private Integer problemId;

    public DiscussionRequest() {
    }

    public DiscussionRequest(String content, Integer problemId) {
        this.content = content;
        this.problemId = problemId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getProblemId() {
        return problemId;
    }

    public void setProblemId(Integer problemId) {
        this.problemId = problemId;
    }
}
