package com.example.demo.Repository;

import com.example.demo.Entities.DiscussionReaction;
import com.example.demo.Entities.DiscussionReactionId;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscussionReactionRepository extends JpaRepository<DiscussionReaction, DiscussionReactionId> {

    @Query("SELECT dr FROM DiscussionReaction dr WHERE dr.id.userId = :userId AND dr.id.discussionId = :discussionId")
    Optional<DiscussionReaction> findByUserIdAndDiscussionId(@Param("userId") Integer userId, @Param("discussionId") Integer discussionId);

    @Query("SELECT COUNT(dr) FROM DiscussionReaction dr WHERE dr.id.discussionId = :discussionId AND dr.liked = true")
    long countLikesByDiscussionId(@Param("discussionId") Integer discussionId);

    @Modifying
    @Query("DELETE FROM DiscussionReaction dr WHERE dr.id.discussionId = :discussionId")
    void deleteByDiscussionId(@Param("discussionId") Integer discussionId);
}
