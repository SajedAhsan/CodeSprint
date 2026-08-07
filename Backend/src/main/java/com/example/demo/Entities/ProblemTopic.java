package com.example.demo.Entities;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "problem_topic")
public class ProblemTopic {

    @EmbeddedId
    private ProblemTopicId id;

    public ProblemTopic() {
    }

    public ProblemTopic(ProblemTopicId id) {
        this.id = id;
    }

    public ProblemTopicId getId() {
        return id;
    }

    public void setId(ProblemTopicId id) {
        this.id = id;
    }
}