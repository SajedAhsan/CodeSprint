package com.example.demo.Repository;

import com.example.demo.Entities.ProblemTopic;
import com.example.demo.Entities.ProblemTopicId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProblemTopicRepository extends JpaRepository<ProblemTopic, ProblemTopicId> {

    @Query(value = "SELECT * FROM problem_topic", nativeQuery = true)
    List<ProblemTopic> findAllProblemTopics();

    @Query(value = "SELECT * FROM problem_topic WHERE problem_id = :problemId", nativeQuery = true)
    List<ProblemTopic> findByProblemId(@Param("problemId") Integer problemId);

    @Query(value = "SELECT * FROM problem_topic WHERE topic_id = :topicId", nativeQuery = true)
    List<ProblemTopic> findByTopicId(@Param("topicId") Integer topicId);

    @Query(value = "SELECT topic_id FROM problem_topic WHERE problem_id = :problemId", nativeQuery = true)
    List<Integer> findTopicIdsByProblemId(@Param("problemId") Integer problemId);

    @Modifying
    @Query(value = "DELETE FROM problem_topic WHERE problem_id = :problemId", nativeQuery = true)
    void deleteByProblemId(@Param("problemId") Integer problemId);
}