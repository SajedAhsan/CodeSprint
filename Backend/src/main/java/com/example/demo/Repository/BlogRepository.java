package com.example.demo.Repository;

import com.example.demo.Entities.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Integer> {

    List<Blog> findAllByOrderByCreatedAtDesc();

    List<Blog> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
}
