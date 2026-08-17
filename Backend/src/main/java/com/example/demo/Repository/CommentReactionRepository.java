package com.example.demo.Repository;

import com.example.demo.Entities.CommentReaction;
import com.example.demo.Entities.CommentReactionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface CommentReactionRepository extends JpaRepository<CommentReaction, CommentReactionId> {

    @Query("SELECT cr FROM CommentReaction cr WHERE cr.id.userId = :userId AND cr.id.commentId = :commentId")
    Optional<CommentReaction> findByUserIdAndCommentId(@Param("userId") Integer userId, @Param("commentId") Integer commentId);

    @Query("SELECT COUNT(cr) FROM CommentReaction cr WHERE cr.id.commentId = :commentId AND cr.liked = true")
    long countLikesByCommentId(@Param("commentId") Integer commentId);

    @Modifying
    @Query("DELETE FROM CommentReaction cr WHERE cr.id.commentId = :commentId")
    void deleteByCommentId(@Param("commentId") Integer commentId);

    @Modifying
    @Query("DELETE FROM CommentReaction cr WHERE cr.id.commentId IN :commentIds")
    void deleteByCommentIdIn(@Param("commentIds") Collection<Integer> commentIds);
}
