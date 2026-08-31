package com.example.demo.Repository;

import com.example.demo.Entities.BlogComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogCommentRepository extends JpaRepository<BlogComment, Integer> {

    @Query("SELECT bc FROM BlogComment bc WHERE bc.blog.blogId = :blogId")
    List<BlogComment> findByBlog_BlogId(@Param("blogId") Integer blogId);

    @Query("SELECT bc.commentId FROM BlogComment bc WHERE bc.blog.blogId = :blogId")
    List<Integer> findCommentIdsByBlogId(@Param("blogId") Integer blogId);

    @Query("SELECT bc FROM BlogComment bc WHERE bc.commentId = :commentId")
    Optional<BlogComment> findByComment_CommentId(@Param("commentId") Integer commentId);

    @Modifying
    @Query("DELETE FROM BlogComment bc WHERE bc.blog.blogId = :blogId")
    void deleteByBlogId(@Param("blogId") Integer blogId);

    @Modifying
    @Query("DELETE FROM BlogComment bc WHERE bc.commentId = :commentId")
    void deleteByCommentId(@Param("commentId") Integer commentId);
}
