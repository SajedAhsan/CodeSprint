package com.example.demo.Repository;

import com.example.demo.Entities.ProblemTopic;
import com.example.demo.Entities.ProblemTopicId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemTopicRepository extends JpaRepository<ProblemTopic, ProblemTopicId> {
}