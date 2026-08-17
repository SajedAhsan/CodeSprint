package com.example.demo.Repository;

import com.example.demo.Entities.BlogReaction;
import com.example.demo.Entities.BlogReactionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogReactionRepository extends JpaRepository<BlogReaction, BlogReactionId> {

    @Query("SELECT br FROM BlogReaction br WHERE br.id.userId = :userId AND br.id.blogId = :blogId")
    Optional<BlogReaction> findByUserIdAndBlogId(@Param("userId") Integer userId, @Param("blogId") Integer blogId);

    @Query("SELECT COUNT(br) FROM BlogReaction br WHERE br.id.blogId = :blogId AND br.liked = true")
    long countLikesByBlogId(@Param("blogId") Integer blogId);

    @Modifying
    @Query("DELETE FROM BlogReaction br WHERE br.id.blogId = :blogId")
    void deleteByBlogId(@Param("blogId") Integer blogId);
}
