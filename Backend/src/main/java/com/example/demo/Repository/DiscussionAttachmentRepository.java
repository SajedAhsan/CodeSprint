package com.example.demo.Repository;

import com.example.demo.Entities.DiscussionAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiscussionAttachmentRepository extends JpaRepository<DiscussionAttachment, Integer> {

    @Query("SELECT da FROM DiscussionAttachment da WHERE da.discussion.discussionId = :discussionId")
    List<DiscussionAttachment> findByDiscussion_DiscussionId(@Param("discussionId") Integer discussionId);

    @Query("SELECT da.attachmentId FROM DiscussionAttachment da WHERE da.discussion.discussionId = :discussionId")
    List<Integer> findAttachmentIdsByDiscussionId(@Param("discussionId") Integer discussionId);

    @Modifying
    @Query("DELETE FROM DiscussionAttachment da WHERE da.discussion.discussionId = :discussionId")
    void deleteByDiscussionId(@Param("discussionId") Integer discussionId);

    @Modifying
    @Query("DELETE FROM DiscussionAttachment da WHERE da.attachmentId = :attachmentId")
    void deleteByAttachmentId(@Param("attachmentId") Integer attachmentId);

    @Query("SELECT da FROM DiscussionAttachment da WHERE da.attachmentId = :attachmentId")
    Optional<DiscussionAttachment> findByAttachment_AttachmentId(@Param("attachmentId") Integer attachmentId);
}
