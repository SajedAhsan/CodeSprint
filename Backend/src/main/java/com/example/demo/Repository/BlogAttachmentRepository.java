package com.example.demo.Repository;

import com.example.demo.Entities.BlogAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogAttachmentRepository extends JpaRepository<BlogAttachment, Integer> {

    List<BlogAttachment> findByBlog_BlogId(Integer blogId);

    @Query("SELECT ba.attachmentId FROM BlogAttachment ba WHERE ba.blog.blogId = :blogId")
    List<Integer> findAttachmentIdsByBlogId(@Param("blogId") Integer blogId);

    @Modifying
    @Query("DELETE FROM BlogAttachment ba WHERE ba.blog.blogId = :blogId")
    void deleteByBlogId(@Param("blogId") Integer blogId);

    @Modifying
    @Query("DELETE FROM BlogAttachment ba WHERE ba.attachmentId = :attachmentId")
    void deleteByAttachmentId(@Param("attachmentId") Integer attachmentId);

    Optional<BlogAttachment> findByAttachment_AttachmentId(Integer attachmentId);
}
