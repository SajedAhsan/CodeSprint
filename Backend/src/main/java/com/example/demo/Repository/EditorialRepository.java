package com.example.demo.Repository;

import com.example.demo.Entities.Editorial;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EditorialRepository extends JpaRepository<Editorial, Integer> {

    @Query(value = "SELECT * FROM editorials WHERE problem_id = :problemId", nativeQuery = true)
    Optional<Editorial> findByProblemId(@Param("problemId") Integer problemId);
}
