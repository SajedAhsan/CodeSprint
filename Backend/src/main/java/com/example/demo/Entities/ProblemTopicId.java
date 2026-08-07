package com.example.demo.Entities;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ProblemTopicId implements Serializable {

    @Column(name = "problem_id")
    private Integer problemId;

    @Column(name = "topic_id")
    private Integer topicId;

    public ProblemTopicId() {
    }

    public ProblemTopicId(Integer problemId, Integer topicId) {
        this.problemId = problemId;
        this.topicId = topicId;
    }

    public Integer getProblemId() {
        return problemId;
    }

    public void setProblemId(Integer problemId) {
        this.problemId = problemId;
    }

    public Integer getTopicId() {
        return topicId;
    }

    public void setTopicId(Integer topicId) {
        this.topicId = topicId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProblemTopicId)) return false;
        ProblemTopicId that = (ProblemTopicId) o;
        return Objects.equals(problemId, that.problemId) &&
               Objects.equals(topicId, that.topicId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(problemId, topicId);
    }
}