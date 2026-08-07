package com.example.demo.Repository;

import com.example.demo.Entities.Topic;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TopicRepository extends JpaRepository<Topic, Integer> {

    @Query(value = "SELECT * FROM topic WHERE LOWER(topic_name) = LOWER(:topicName) LIMIT 1", nativeQuery = true)
    Optional<Topic> findByTopicNameIgnoreCase(@Param("topicName") String topicName);
}