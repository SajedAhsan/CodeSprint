package com.example.demo.Repository;

import com.example.demo.Entities.Discussion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscussionRepository extends JpaRepository<Discussion, Integer> {

    List<Discussion> findByProblem_ProblemIdOrderByCreatedAtDesc(Integer problemId);

    List<Discussion> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
}
