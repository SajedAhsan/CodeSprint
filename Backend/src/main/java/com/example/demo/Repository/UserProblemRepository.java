package com.example.demo.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.Entities.UserProblem;
import com.example.demo.Entities.UserProblemId;

@Repository
public interface UserProblemRepository extends JpaRepository<UserProblem, UserProblemId> {

    @Query(value = "SELECT * FROM user_problem WHERE user_id = :userId AND problem_id = :problemId LIMIT 1", nativeQuery = true)
    Optional<UserProblem> findByUserIdAndProblemId(@Param("userId") Integer userId,
            @Param("problemId") Integer problemId);

    @Query(value = "SELECT * FROM user_problem WHERE user_id = :userId", nativeQuery = true)
    List<UserProblem> findByUserId(@Param("userId") Integer userId);

    @Query(value = "SELECT * FROM user_problem WHERE problem_id = :problemId", nativeQuery = true)
    List<UserProblem> findByProblemId(@Param("problemId") Integer problemId);

    @Modifying
    @Query(value = "DELETE FROM user_problem WHERE user_id = :userId AND problem_id = :problemId", nativeQuery = true)
    void deleteByUserIdAndProblemId(@Param("userId") Integer userId, @Param("problemId") Integer problemId);
}