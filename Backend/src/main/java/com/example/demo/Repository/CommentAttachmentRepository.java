package com.example.demo.Repository;

import com.example.demo.Entities.CommentAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentAttachmentRepository extends JpaRepository<CommentAttachment, Integer> {

    @Query("SELECT ca FROM CommentAttachment ca WHERE ca.comment.commentId = :commentId")
    List<CommentAttachment> findByComment_CommentId(@Param("commentId") Integer commentId);

    @Query("SELECT ca.attachmentId FROM CommentAttachment ca WHERE ca.comment.commentId = :commentId")
    List<Integer> findAttachmentIdsByCommentId(@Param("commentId") Integer commentId);

    @Query("SELECT ca.attachmentId FROM CommentAttachment ca WHERE ca.comment.commentId IN :commentIds")
    List<Integer> findAttachmentIdsByCommentIdIn(@Param("commentIds") List<Integer> commentIds);

    @Modifying
    @Query("DELETE FROM CommentAttachment ca WHERE ca.comment.commentId = :commentId")
    void deleteByCommentId(@Param("commentId") Integer commentId);

    @Modifying
    @Query("DELETE FROM CommentAttachment ca WHERE ca.comment.commentId IN :commentIds")
    void deleteByCommentIdIn(@Param("commentIds") List<Integer> commentIds);

    @Modifying
    @Query("DELETE FROM CommentAttachment ca WHERE ca.attachmentId = :attachmentId")
    void deleteByAttachmentId(@Param("attachmentId") Integer attachmentId);

    @Query("SELECT ca FROM CommentAttachment ca WHERE ca.attachmentId = :attachmentId")
    Optional<CommentAttachment> findByAttachment_AttachmentId(@Param("attachmentId") Integer attachmentId);
}
