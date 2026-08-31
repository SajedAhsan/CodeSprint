package com.example.demo.Repository;

import com.example.demo.Entities.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Integer> {

    @Query(value = "SELECT * FROM attachment WHERE user_id = :userId", nativeQuery = true)
    List<Attachment> findByUser_UserId(@Param("userId") Integer userId);
}
