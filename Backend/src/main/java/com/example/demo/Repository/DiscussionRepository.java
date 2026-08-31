package com.example.demo.Repository;

import com.example.demo.Entities.Discussion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscussionRepository extends JpaRepository<Discussion, Integer> {

    @Query(value = "SELECT * FROM discussion WHERE problem_id = :problemId ORDER BY created_at DESC", nativeQuery = true)
    List<Discussion> findByProblem_ProblemIdOrderByCreatedAtDesc(@Param("problemId") Integer problemId);

    @Query(value = "SELECT * FROM discussion WHERE user_id = :userId ORDER BY created_at DESC", nativeQuery = true)
    List<Discussion> findByUser_UserIdOrderByCreatedAtDesc(@Param("userId") Integer userId);
}
