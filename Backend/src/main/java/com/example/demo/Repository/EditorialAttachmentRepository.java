package com.example.demo.Repository;

import com.example.demo.Entities.EditorialAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EditorialAttachmentRepository extends JpaRepository<EditorialAttachment, Integer> {

    @Query("SELECT ea FROM EditorialAttachment ea WHERE ea.editorial.editorialId = :editorialId")
    List<EditorialAttachment> findByEditorial_EditorialId(@Param("editorialId") Integer editorialId);

    @Query("SELECT ea.attachmentId FROM EditorialAttachment ea WHERE ea.editorial.editorialId = :editorialId")
    List<Integer> findAttachmentIdsByEditorialId(@Param("editorialId") Integer editorialId);

    @Modifying
    @Query("DELETE FROM EditorialAttachment ea WHERE ea.editorial.editorialId = :editorialId")
    void deleteByEditorialId(@Param("editorialId") Integer editorialId);

    @Modifying
    @Query("DELETE FROM EditorialAttachment ea WHERE ea.attachmentId = :attachmentId")
    void deleteByAttachmentId(@Param("attachmentId") Integer attachmentId);

    @Query("SELECT ea FROM EditorialAttachment ea WHERE ea.attachmentId = :attachmentId")
    Optional<EditorialAttachment> findByAttachment_AttachmentId(@Param("attachmentId") Integer attachmentId);
}
