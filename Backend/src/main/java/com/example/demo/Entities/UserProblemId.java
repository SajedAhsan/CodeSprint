package com.example.demo.Entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserProblemId implements Serializable {

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "problem_id")
    private Integer problemId;

    public UserProblemId() {
    }

    public UserProblemId(Integer userId, Integer problemId) {
        this.userId = userId;
        this.problemId = problemId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getProblemId() {
        return problemId;
    }

    public void setProblemId(Integer problemId) {
        this.problemId = problemId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;

        if (!(o instanceof UserProblemId)) return false;

        UserProblemId that = (UserProblemId) o;

        return Objects.equals(userId, that.userId)
                && Objects.equals(problemId, that.problemId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, problemId);
    }
}