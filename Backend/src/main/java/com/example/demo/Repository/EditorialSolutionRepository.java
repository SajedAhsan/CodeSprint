package com.example.demo.Repository;

import com.example.demo.Entities.EditorialSolution;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EditorialSolutionRepository extends JpaRepository<EditorialSolution, Integer> {

    @Query(value = "SELECT * FROM editorial_solutions WHERE editorial_id = :editorialId", nativeQuery = true)
    List<EditorialSolution> findByEditorialId(@Param("editorialId") Integer editorialId);
}
