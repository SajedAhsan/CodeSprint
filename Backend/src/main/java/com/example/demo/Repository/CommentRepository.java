package com.example.demo.Repository;

import com.example.demo.Entities.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {

    @Query(value = "SELECT * FROM comment WHERE parent_comment_id = :parentCommentId", nativeQuery = true)
    List<Comment> findByParentComment_CommentId(@Param("parentCommentId") Integer parentCommentId);

    @Query(value = "SELECT * FROM comment WHERE user_id = :userId", nativeQuery = true)
    List<Comment> findByUser_UserId(@Param("userId") Integer userId);
}
