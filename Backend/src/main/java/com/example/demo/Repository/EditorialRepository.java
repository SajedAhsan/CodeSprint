package com.example.demo.Repository;

import com.example.demo.Entities.Editorial;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EditorialRepository extends JpaRepository<Editorial, Integer> {

    @Query("SELECT e FROM Editorial e WHERE e.problem.problemId = :problemId")
    Optional<Editorial> findByProblemId(@Param("problemId") Integer problemId);
}
