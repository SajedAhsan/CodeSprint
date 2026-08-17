package com.example.demo.Repository;

import com.example.demo.dto.BlogResponse;
import com.example.demo.dto.CommentResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.*;

@Repository
public class BlogJdbcRepository {

    private final JdbcTemplate jdbcTemplate;

    public BlogJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void linkCommentToBlog(Integer commentId, Integer blogId) {
        String sql = "INSERT INTO blog_comment (comment_id, blog_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, commentId, blogId);
    }

    public List<BlogResponse> findAllBlogs(Integer currentUserId) {
        String sql = """
                SELECT
                    b.blog_id,
                    b.title,
                    b.content,
                    b.created_at,
                    b.updated_at,
                    u.user_id AS author_id,
                    u.username AS author_username,
                    COALESCE(comm.comment_count, 0) AS comment_count,
                    COALESCE(react.like_count, 0) AS like_count,
                    CASE WHEN user_react.liked = 1 THEN TRUE ELSE FALSE END AS is_liked_by_current_user
                FROM blog b
                INNER JOIN users u ON b.user_id = u.user_id
                LEFT JOIN (
                    SELECT blog_id, COUNT(*) AS comment_count
                    FROM blog_comment
                    GROUP BY blog_id
                ) comm ON comm.blog_id = b.blog_id
                LEFT JOIN (
                    SELECT blog_id, COUNT(*) AS like_count
                    FROM blog_reaction
                    WHERE liked = 1
                    GROUP BY blog_id
                ) react ON react.blog_id = b.blog_id
                LEFT JOIN blog_reaction user_react
                    ON user_react.blog_id = b.blog_id
                    AND user_react.user_id = ?
                ORDER BY b.created_at DESC
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    Timestamp createdTs = rs.getTimestamp("created_at");
                    Timestamp updatedTs = rs.getTimestamp("updated_at");

                    return new BlogResponse(
                            rs.getInt("blog_id"),
                            rs.getString("title"),
                            rs.getString("content"),
                            rs.getInt("author_id"),
                            rs.getString("author_username"),
                            createdTs != null ? createdTs.toLocalDateTime() : null,
                            updatedTs != null ? updatedTs.toLocalDateTime() : null,
                            rs.getLong("comment_count"),
                            rs.getLong("like_count"),
                            rs.getBoolean("is_liked_by_current_user")
                    );
                },
                currentUserId
        );
    }

    public Optional<BlogResponse> findBlogSummaryById(Integer blogId, Integer currentUserId) {
        String sql = """
                SELECT
                    b.blog_id,
                    b.title,
                    b.content,
                    b.created_at,
                    b.updated_at,
                    u.user_id AS author_id,
                    u.username AS author_username,
                    COALESCE(comm.comment_count, 0) AS comment_count,
                    COALESCE(react.like_count, 0) AS like_count,
                    CASE WHEN user_react.liked = 1 THEN TRUE ELSE FALSE END AS is_liked_by_current_user
                FROM blog b
                INNER JOIN users u ON b.user_id = u.user_id
                LEFT JOIN (
                    SELECT blog_id, COUNT(*) AS comment_count
                    FROM blog_comment
                    GROUP BY blog_id
                ) comm ON comm.blog_id = b.blog_id
                LEFT JOIN (
                    SELECT blog_id, COUNT(*) AS like_count
                    FROM blog_reaction
                    WHERE liked = 1
                    GROUP BY blog_id
                ) react ON react.blog_id = b.blog_id
                LEFT JOIN blog_reaction user_react
                    ON user_react.blog_id = b.blog_id
                    AND user_react.user_id = ?
                WHERE b.blog_id = ?
                """;

        List<BlogResponse> results = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    Timestamp createdTs = rs.getTimestamp("created_at");
                    Timestamp updatedTs = rs.getTimestamp("updated_at");

                    return new BlogResponse(
                            rs.getInt("blog_id"),
                            rs.getString("title"),
                            rs.getString("content"),
                            rs.getInt("author_id"),
                            rs.getString("author_username"),
                            createdTs != null ? createdTs.toLocalDateTime() : null,
                            updatedTs != null ? updatedTs.toLocalDateTime() : null,
                            rs.getLong("comment_count"),
                            rs.getLong("like_count"),
                            rs.getBoolean("is_liked_by_current_user")
                    );
                },
                currentUserId,
                blogId
        );

        return results.stream().findFirst();
    }

    public List<CommentResponse> findNestedCommentsByBlogId(Integer blogId, Integer currentUserId) {
        String sql = """
                SELECT
                    c.comment_id,
                    bc.blog_id,
                    c.comment AS content,
                    c.user_id AS author_id,
                    u.username AS author_username,
                    c.parent_comment_id,
                    c.created_at,
                    c.updated_at,
                    COALESCE(creact.like_count, 0) AS like_count,
                    CASE WHEN user_creact.liked = 1 THEN TRUE ELSE FALSE END AS is_liked_by_current_user
                FROM blog_comment bc
                INNER JOIN comment c ON bc.comment_id = c.comment_id
                INNER JOIN users u ON c.user_id = u.user_id
                LEFT JOIN (
                    SELECT comment_id, COUNT(*) AS like_count
                    FROM comment_reaction
                    WHERE liked = 1
                    GROUP BY comment_id
                ) creact ON creact.comment_id = c.comment_id
                LEFT JOIN comment_reaction user_creact
                    ON user_creact.comment_id = c.comment_id
                    AND user_creact.user_id = ?
                WHERE bc.blog_id = ?
                ORDER BY c.created_at ASC
                """;

        List<CommentResponse> flatComments = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    Timestamp createdTs = rs.getTimestamp("created_at");
                    Timestamp updatedTs = rs.getTimestamp("updated_at");
                    Integer parentId = (Integer) rs.getObject("parent_comment_id");

                    return new CommentResponse(
                            rs.getInt("comment_id"),
                            null,
                            rs.getInt("blog_id"),
                            rs.getString("content"),
                            rs.getInt("author_id"),
                            rs.getString("author_username"),
                            parentId,
                            createdTs != null ? createdTs.toLocalDateTime() : null,
                            updatedTs != null ? updatedTs.toLocalDateTime() : null,
                            rs.getLong("like_count"),
                            rs.getBoolean("is_liked_by_current_user")
                    );
                },
                currentUserId,
                blogId
        );

        // Build hierarchical tree
        Map<Integer, CommentResponse> commentMap = new LinkedHashMap<>();
        for (CommentResponse comment : flatComments) {
            commentMap.put(comment.getCommentId(), comment);
        }

        List<CommentResponse> rootComments = new ArrayList<>();
        for (CommentResponse comment : flatComments) {
            Integer parentId = comment.getParentCommentId();
            if (parentId != null && commentMap.containsKey(parentId)) {
                commentMap.get(parentId).getReplies().add(comment);
            } else {
                rootComments.add(comment);
            }
        }

        return rootComments;
    }
}
