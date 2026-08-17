package com.example.demo.Repository;

import com.example.demo.dto.AttachmentResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.*;

@Repository
public class AttachmentJdbcRepository {

    private final JdbcTemplate jdbcTemplate;

    public AttachmentJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void linkAttachmentToBlog(Integer attachmentId, Integer blogId) {
        String sql = "INSERT INTO blog_attachment (attachment_id, blog_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, attachmentId, blogId);
    }

    public void linkAttachmentToDiscussion(Integer attachmentId, Integer discussionId) {
        String sql = "INSERT INTO discussion_attachment (attachment_id, discussion_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, attachmentId, discussionId);
    }

    public void linkAttachmentToEditorial(Integer attachmentId, Integer editorialId) {
        String sql = "INSERT INTO editorial_attachment (attachment_id, editorial_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, attachmentId, editorialId);
    }

    public void linkAttachmentToComment(Integer attachmentId, Integer commentId) {
        String sql = "INSERT INTO comment_attachment (attachment_id, comment_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, attachmentId, commentId);
    }

    public void deleteLinksByAttachmentId(Integer attachmentId) {
        jdbcTemplate.update("DELETE FROM blog_attachment WHERE attachment_id = ?", attachmentId);
        jdbcTemplate.update("DELETE FROM discussion_attachment WHERE attachment_id = ?", attachmentId);
        jdbcTemplate.update("DELETE FROM editorial_attachment WHERE attachment_id = ?", attachmentId);
        jdbcTemplate.update("DELETE FROM comment_attachment WHERE attachment_id = ?", attachmentId);
    }

    public List<AttachmentResponse> findAttachmentsByBlogId(Integer blogId) {
        String sql = """
                SELECT
                    a.attachment_id,
                    a.user_id,
                    u.username AS author_username,
                    a.filename,
                    a.filetype,
                    a.file_url,
                    a.uploaded_at
                FROM blog_attachment ba
                INNER JOIN attachment a ON ba.attachment_id = a.attachment_id
                INNER JOIN users u ON a.user_id = u.user_id
                WHERE ba.blog_id = ?
                ORDER BY a.uploaded_at ASC
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> mapRowToAttachment(rs), blogId);
    }

    public Map<Integer, List<AttachmentResponse>> findAttachmentsForBlogIds(Collection<Integer> blogIds) {
        if (blogIds == null || blogIds.isEmpty()) {
            return Collections.emptyMap();
        }

        String inSql = String.join(",", Collections.nCopies(blogIds.size(), "?"));
        String sql = String.format("""
                SELECT
                    ba.blog_id,
                    a.attachment_id,
                    a.user_id,
                    u.username AS author_username,
                    a.filename,
                    a.filetype,
                    a.file_url,
                    a.uploaded_at
                FROM blog_attachment ba
                INNER JOIN attachment a ON ba.attachment_id = a.attachment_id
                INNER JOIN users u ON a.user_id = u.user_id
                WHERE ba.blog_id IN (%s)
                ORDER BY a.uploaded_at ASC
                """, inSql);

        Map<Integer, List<AttachmentResponse>> map = new HashMap<>();
        for (Integer id : blogIds) {
            map.put(id, new ArrayList<>());
        }

        jdbcTemplate.query(
                sql,
                rs -> {
                    Integer bId = rs.getInt("blog_id");
                    AttachmentResponse att = mapRowToAttachment(rs);
                    map.computeIfAbsent(bId, k -> new ArrayList<>()).add(att);
                },
                blogIds.toArray()
        );

        return map;
    }

    public List<AttachmentResponse> findAttachmentsByEditorialId(Integer editorialId) {
        String sql = """
                SELECT
                    a.attachment_id,
                    a.user_id,
                    u.username AS author_username,
                    a.filename,
                    a.filetype,
                    a.file_url,
                    a.uploaded_at
                FROM editorial_attachment ea
                INNER JOIN attachment a ON ea.attachment_id = a.attachment_id
                INNER JOIN users u ON a.user_id = u.user_id
                WHERE ea.editorial_id = ?
                ORDER BY a.uploaded_at ASC
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> mapRowToAttachment(rs), editorialId);
    }

    public List<AttachmentResponse> findAttachmentsByCommentId(Integer commentId) {
        String sql = """
                SELECT
                    a.attachment_id,
                    a.user_id,
                    u.username AS author_username,
                    a.filename,
                    a.filetype,
                    a.file_url,
                    a.uploaded_at
                FROM comment_attachment ca
                INNER JOIN attachment a ON ca.attachment_id = a.attachment_id
                INNER JOIN users u ON a.user_id = u.user_id
                WHERE ca.comment_id = ?
                ORDER BY a.uploaded_at ASC
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> mapRowToAttachment(rs), commentId);
    }

    public Map<Integer, List<AttachmentResponse>> findAttachmentsForCommentIds(Collection<Integer> commentIds) {
        if (commentIds == null || commentIds.isEmpty()) {
            return Collections.emptyMap();
        }

        String inSql = String.join(",", Collections.nCopies(commentIds.size(), "?"));
        String sql = String.format("""
                SELECT
                    ca.comment_id,
                    a.attachment_id,
                    a.user_id,
                    u.username AS author_username,
                    a.filename,
                    a.filetype,
                    a.file_url,
                    a.uploaded_at
                FROM comment_attachment ca
                INNER JOIN attachment a ON ca.attachment_id = a.attachment_id
                INNER JOIN users u ON a.user_id = u.user_id
                WHERE ca.comment_id IN (%s)
                ORDER BY a.uploaded_at ASC
                """, inSql);

        Map<Integer, List<AttachmentResponse>> map = new HashMap<>();
        for (Integer id : commentIds) {
            map.put(id, new ArrayList<>());
        }

        jdbcTemplate.query(
                sql,
                rs -> {
                    Integer cId = rs.getInt("comment_id");
                    AttachmentResponse att = mapRowToAttachment(rs);
                    map.computeIfAbsent(cId, k -> new ArrayList<>()).add(att);
                },
                commentIds.toArray()
        );

        return map;
    }

    public List<AttachmentResponse> findAttachmentsByDiscussionId(Integer discussionId) {
        String sql = """
                SELECT
                    a.attachment_id,
                    a.user_id,
                    u.username AS author_username,
                    a.filename,
                    a.filetype,
                    a.file_url,
                    a.uploaded_at
                FROM discussion_attachment da
                INNER JOIN attachment a ON da.attachment_id = a.attachment_id
                INNER JOIN users u ON a.user_id = u.user_id
                WHERE da.discussion_id = ?
                ORDER BY a.uploaded_at ASC
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> mapRowToAttachment(rs), discussionId);
    }

    public Map<Integer, List<AttachmentResponse>> findAttachmentsForDiscussionIds(Collection<Integer> discussionIds) {
        if (discussionIds == null || discussionIds.isEmpty()) {
            return Collections.emptyMap();
        }

        String inSql = String.join(",", Collections.nCopies(discussionIds.size(), "?"));
        String sql = String.format("""
                SELECT
                    da.discussion_id,
                    a.attachment_id,
                    a.user_id,
                    u.username AS author_username,
                    a.filename,
                    a.filetype,
                    a.file_url,
                    a.uploaded_at
                FROM discussion_attachment da
                INNER JOIN attachment a ON da.attachment_id = a.attachment_id
                INNER JOIN users u ON a.user_id = u.user_id
                WHERE da.discussion_id IN (%s)
                ORDER BY a.uploaded_at ASC
                """, inSql);

        Map<Integer, List<AttachmentResponse>> map = new HashMap<>();
        for (Integer id : discussionIds) {
            map.put(id, new ArrayList<>());
        }

        jdbcTemplate.query(
                sql,
                rs -> {
                    Integer dId = rs.getInt("discussion_id");
                    AttachmentResponse att = mapRowToAttachment(rs);
                    map.computeIfAbsent(dId, k -> new ArrayList<>()).add(att);
                },
                discussionIds.toArray()
        );

        return map;
    }

    private AttachmentResponse mapRowToAttachment(java.sql.ResultSet rs) throws java.sql.SQLException {
        Integer attachmentId = rs.getInt("attachment_id");
        Integer userId = rs.getInt("user_id");
        String username = rs.getString("author_username");
        String filename = rs.getString("filename");
        String filetype = rs.getString("filetype");
        String fileUrl = rs.getString("file_url");
        Timestamp uploadedTs = rs.getTimestamp("uploaded_at");

        String downloadUrl = "/api/attachments/" + attachmentId + "/download";

        return new AttachmentResponse(
                attachmentId,
                userId,
                username,
                filename,
                filetype,
                fileUrl,
                downloadUrl,
                uploadedTs != null ? uploadedTs.toLocalDateTime() : null
        );
    }
}
