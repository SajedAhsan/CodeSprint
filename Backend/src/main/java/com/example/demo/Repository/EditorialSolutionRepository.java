package com.example.demo.Repository;

import com.example.demo.Entities.EditorialSolution;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EditorialSolutionRepository extends JpaRepository<EditorialSolution, Integer> {

    @Query("SELECT s FROM EditorialSolution s WHERE s.editorial.editorialId = :editorialId")
    List<EditorialSolution> findByEditorialId(@Param("editorialId") Integer editorialId);

    @Query("SELECT s FROM EditorialSolution s WHERE s.editorial.editorialId = :editorialId AND LOWER(s.language) = LOWER(:language)")
    List<EditorialSolution> findByEditorialIdAndLanguage(@Param("editorialId") Integer editorialId, @Param("language") String language);
}
