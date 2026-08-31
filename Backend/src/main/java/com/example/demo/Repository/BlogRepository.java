package com.example.demo.Repository;

import com.example.demo.Entities.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Integer> {

    @Query(value = "SELECT * FROM blog ORDER BY created_at DESC", nativeQuery = true)
    List<Blog> findAllByOrderByCreatedAtDesc();

    @Query(value = "SELECT * FROM blog WHERE user_id = :userId ORDER BY created_at DESC", nativeQuery = true)
    List<Blog> findByUser_UserIdOrderByCreatedAtDesc(@Param("userId") Integer userId);
}
