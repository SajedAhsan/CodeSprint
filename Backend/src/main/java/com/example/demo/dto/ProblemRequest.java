package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ProblemRequest {

    @NotBlank
    @Size(max = 255)
    private String topic;

    @NotBlank
    @Size(max = 255)
    private String title;

    @Size(max = 500)
    private String externalLink;

    @NotBlank
    @Pattern(regexp = "Easy|Medium|Hard", message = "Difficulty must be Easy, Medium, or Hard")
    private String difficulty;

    @NotBlank
    private String concept;

    private Boolean premium;

    public ProblemRequest() {
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getExternalLink() {
        return externalLink;
    }

    public void setExternalLink(String externalLink) {
        this.externalLink = externalLink;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getConcept() {
        return concept;
    }

    public void setConcept(String concept) {
        this.concept = concept;
    }

    public Boolean getPremium() {
        return premium;
    }

    public void setPremium(Boolean premium) {
        this.premium = premium;
    }
}