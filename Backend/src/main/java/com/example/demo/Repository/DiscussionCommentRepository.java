package com.example.demo.Repository;

import com.example.demo.Entities.DiscussionComment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscussionCommentRepository extends JpaRepository<DiscussionComment, Integer> {

    List<DiscussionComment> findByDiscussion_DiscussionId(Integer discussionId);

    @Query("SELECT dc.commentId FROM DiscussionComment dc WHERE dc.discussion.discussionId = :discussionId")
    List<Integer> findCommentIdsByDiscussionId(@Param("discussionId") Integer discussionId);

    Optional<DiscussionComment> findByComment_CommentId(Integer commentId);

    @Modifying
    @Query("DELETE FROM DiscussionComment dc WHERE dc.discussion.discussionId = :discussionId")
    void deleteByDiscussionId(@Param("discussionId") Integer discussionId);

    @Modifying
    @Query("DELETE FROM DiscussionComment dc WHERE dc.commentId = :commentId")
    void deleteByCommentId(@Param("commentId") Integer commentId);
}
