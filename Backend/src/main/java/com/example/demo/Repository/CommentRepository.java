package com.example.demo.Repository;

import com.example.demo.Entities.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {

    List<Comment> findByParentComment_CommentId(Integer parentCommentId);

    List<Comment> findByUser_UserId(Integer userId);
}
