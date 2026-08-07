package com.example.demo.Repository;

import com.example.demo.Entities.Problem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProblemRepository extends JpaRepository<Problem, Integer> {

    @Query(value = "SELECT * FROM problem ORDER BY created_at DESC", nativeQuery = true)
    List<Problem> findAllProblems();

    @Query(value = "SELECT * FROM problem WHERE problem_id = :problemId", nativeQuery = true)
    Optional<Problem> findProblemById(@Param("problemId") Integer problemId);

    @Query(value = "SELECT * FROM problem WHERE added_by = :addedBy ORDER BY created_at DESC", nativeQuery = true)
    List<Problem> findProblemsByAddedBy(@Param("addedBy") Integer addedBy);

    @Modifying
    @Query(value = "DELETE FROM problem WHERE problem_id = :problemId", nativeQuery = true)
    int deleteProblemById(@Param("problemId") Integer problemId);
}