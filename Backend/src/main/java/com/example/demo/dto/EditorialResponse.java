package com.example.demo.dto;

import java.util.ArrayList;
import java.util.List;

public class EditorialResponse {
    private Integer editorialId;
    private String explanation;
    private String videoLink;
    private List<SolutionItem> solutions;
    private List<AttachmentResponse> attachments = new ArrayList<>();

    public static class SolutionItem {
        private Integer solutionId;
        private String language;
        private String code;

        public Integer getSolutionId() {
            return solutionId;
        }

        public void setSolutionId(Integer solutionId) {
            this.solutionId = solutionId;
        }

        public String getLanguage() {
            return language;
        }

        public void setLanguage(String language) {
            this.language = language;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }
    }

    public Integer getEditorialId() {
        return editorialId;
    }

    public void setEditorialId(Integer editorialId) {
        this.editorialId = editorialId;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getVideoLink() {
        return videoLink;
    }

    public void setVideoLink(String videoLink) {
        this.videoLink = videoLink;
    }

    public List<SolutionItem> getSolutions() {
        return solutions;
    }

    public void setSolutions(List<SolutionItem> solutions) {
        this.solutions = solutions;
    }

    public List<AttachmentResponse> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<AttachmentResponse> attachments) {
        this.attachments = attachments != null ? attachments : new ArrayList<>();
    }
}
