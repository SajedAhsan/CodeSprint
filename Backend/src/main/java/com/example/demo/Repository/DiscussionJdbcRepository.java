package com.example.demo.Repository;

import com.example.demo.dto.AttachmentResponse;
import com.example.demo.dto.CommentResponse;
import com.example.demo.dto.DiscussionDetailResponse;
import com.example.demo.dto.DiscussionResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.*;

@Repository
public class DiscussionJdbcRepository {

    private final JdbcTemplate jdbcTemplate;
    private final AttachmentJdbcRepository attachmentJdbcRepository;

    public DiscussionJdbcRepository(JdbcTemplate jdbcTemplate, AttachmentJdbcRepository attachmentJdbcRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.attachmentJdbcRepository = attachmentJdbcRepository;
    }

    public void linkCommentToDiscussion(Integer commentId, Integer discussionId) {
        String sql = "INSERT INTO discussion_comment (comment_id, discussion_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, commentId, discussionId);
    }

    public List<DiscussionResponse> findDiscussionsByProblemId(Integer problemId, Integer currentUserId) {
        String sql = """
                SELECT
                    d.discussion_id,
                    d.problem_id,
                    d.content,
                    d.created_at,
                    d.updated_at,
                    u.user_id AS author_id,
                    u.username AS author_username,
                    COALESCE(comm.comment_count, 0) AS comment_count,
                    COALESCE(react.like_count, 0) AS like_count,
                    CASE WHEN user_react.liked = 1 THEN TRUE ELSE FALSE END AS is_liked_by_current_user
                FROM discussion d
                INNER JOIN users u ON d.user_id = u.user_id
                LEFT JOIN (
                    SELECT discussion_id, COUNT(*) AS comment_count
                    FROM discussion_comment
                    GROUP BY discussion_id
                ) comm ON comm.discussion_id = d.discussion_id
                LEFT JOIN (
                    SELECT discussion_id, COUNT(*) AS like_count
                    FROM discussion_reaction
                    WHERE liked = 1
                    GROUP BY discussion_id
                ) react ON react.discussion_id = d.discussion_id
                LEFT JOIN discussion_reaction user_react
                    ON user_react.discussion_id = d.discussion_id
                    AND user_react.user_id = ?
                WHERE d.problem_id = ?
                ORDER BY d.created_at DESC
                """;

        List<DiscussionResponse> discussions = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    Timestamp createdTs = rs.getTimestamp("created_at");
                    Timestamp updatedTs = rs.getTimestamp("updated_at");

                    return new DiscussionResponse(
                            rs.getInt("discussion_id"),
                            rs.getInt("problem_id"),
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
                problemId
        );

        if (!discussions.isEmpty()) {
            List<Integer> discIds = discussions.stream().map(DiscussionResponse::getDiscussionId).toList();
            Map<Integer, List<AttachmentResponse>> attMap = attachmentJdbcRepository.findAttachmentsForDiscussionIds(discIds);
            for (DiscussionResponse disc : discussions) {
                disc.setAttachments(attMap.getOrDefault(disc.getDiscussionId(), Collections.emptyList()));
            }
        }

        return discussions;
    }

    public Optional<DiscussionResponse> findDiscussionSummaryById(Integer discussionId, Integer currentUserId) {
        String sql = """
                SELECT
                    d.discussion_id,
                    d.problem_id,
                    d.content,
                    d.created_at,
                    d.updated_at,
                    u.user_id AS author_id,
                    u.username AS author_username,
                    COALESCE(comm.comment_count, 0) AS comment_count,
                    COALESCE(react.like_count, 0) AS like_count,
                    CASE WHEN user_react.liked = 1 THEN TRUE ELSE FALSE END AS is_liked_by_current_user
                FROM discussion d
                INNER JOIN users u ON d.user_id = u.user_id
                LEFT JOIN (
                    SELECT discussion_id, COUNT(*) AS comment_count
                    FROM discussion_comment
                    GROUP BY discussion_id
                ) comm ON comm.discussion_id = d.discussion_id
                LEFT JOIN (
                    SELECT discussion_id, COUNT(*) AS like_count
                    FROM discussion_reaction
                    WHERE liked = 1
                    GROUP BY discussion_id
                ) react ON react.discussion_id = d.discussion_id
                LEFT JOIN discussion_reaction user_react
                    ON user_react.discussion_id = d.discussion_id
                    AND user_react.user_id = ?
                WHERE d.discussion_id = ?
                """;

        List<DiscussionResponse> results = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    Timestamp createdTs = rs.getTimestamp("created_at");
                    Timestamp updatedTs = rs.getTimestamp("updated_at");

                    return new DiscussionResponse(
                            rs.getInt("discussion_id"),
                            rs.getInt("problem_id"),
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
                discussionId
        );

        Optional<DiscussionResponse> optDisc = results.stream().findFirst();
        optDisc.ifPresent(disc -> disc.setAttachments(attachmentJdbcRepository.findAttachmentsByDiscussionId(disc.getDiscussionId())));

        return optDisc;
    }

    public List<CommentResponse> findNestedCommentsByDiscussionId(Integer discussionId) {
        String sql = """
                SELECT
                    c.comment_id,
                    dc.discussion_id,
                    c.comment AS content,
                    c.user_id AS author_id,
                    u.username AS author_username,
                    c.parent_comment_id,
                    c.created_at,
                    c.updated_at
                FROM discussion_comment dc
                INNER JOIN comment c ON dc.comment_id = c.comment_id
                INNER JOIN users u ON c.user_id = u.user_id
                WHERE dc.discussion_id = ?
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
                            rs.getInt("discussion_id"),
                            rs.getString("content"),
                            rs.getInt("author_id"),
                            rs.getString("author_username"),
                            parentId,
                            createdTs != null ? createdTs.toLocalDateTime() : null,
                            updatedTs != null ? updatedTs.toLocalDateTime() : null
                    );
                },
                discussionId
        );

        if (!flatComments.isEmpty()) {
            List<Integer> commentIds = flatComments.stream().map(CommentResponse::getCommentId).toList();
            Map<Integer, List<AttachmentResponse>> attMap = attachmentJdbcRepository.findAttachmentsForCommentIds(commentIds);
            for (CommentResponse c : flatComments) {
                c.setAttachments(attMap.getOrDefault(c.getCommentId(), Collections.emptyList()));
            }
        }

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

    public List<DiscussionDetailResponse> findDiscussionsWithDetailsByProblemId(Integer problemId, Integer currentUserId) {
        List<DiscussionResponse> discussions = findDiscussionsByProblemId(problemId, currentUserId);
        if (discussions.isEmpty()) {
            return Collections.emptyList();
        }

        String sql = """
                SELECT
                    c.comment_id,
                    dc.discussion_id,
                    c.comment AS content,
                    c.user_id AS author_id,
                    u.username AS author_username,
                    c.parent_comment_id,
                    c.created_at,
                    c.updated_at
                FROM discussion_comment dc
                INNER JOIN comment c ON dc.comment_id = c.comment_id
                INNER JOIN users u ON c.user_id = u.user_id
                INNER JOIN discussion d ON dc.discussion_id = d.discussion_id
                WHERE d.problem_id = ?
                ORDER BY c.created_at ASC
                """;

        List<CommentResponse> allComments = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    Timestamp createdTs = rs.getTimestamp("created_at");
                    Timestamp updatedTs = rs.getTimestamp("updated_at");
                    Integer parentId = (Integer) rs.getObject("parent_comment_id");

                    return new CommentResponse(
                            rs.getInt("comment_id"),
                            rs.getInt("discussion_id"),
                            rs.getString("content"),
                            rs.getInt("author_id"),
                            rs.getString("author_username"),
                            parentId,
                            createdTs != null ? createdTs.toLocalDateTime() : null,
                            updatedTs != null ? updatedTs.toLocalDateTime() : null
                    );
                },
                problemId
        );

        if (!allComments.isEmpty()) {
            List<Integer> commentIds = allComments.stream().map(CommentResponse::getCommentId).toList();
            Map<Integer, List<AttachmentResponse>> commentAttMap = attachmentJdbcRepository.findAttachmentsForCommentIds(commentIds);
            for (CommentResponse c : allComments) {
                c.setAttachments(commentAttMap.getOrDefault(c.getCommentId(), Collections.emptyList()));
            }
        }

        // Group comments by discussion_id
        Map<Integer, List<CommentResponse>> commentsByDiscussion = new HashMap<>();
        for (CommentResponse comment : allComments) {
            commentsByDiscussion.computeIfAbsent(comment.getDiscussionId(), k -> new ArrayList<>()).add(comment);
        }

        List<DiscussionDetailResponse> result = new ArrayList<>();
        for (DiscussionResponse disc : discussions) {
            List<CommentResponse> flatForDisc = commentsByDiscussion.getOrDefault(disc.getDiscussionId(), Collections.emptyList());

            Map<Integer, CommentResponse> commentMap = new LinkedHashMap<>();
            for (CommentResponse c : flatForDisc) {
                commentMap.put(c.getCommentId(), c);
            }

            List<CommentResponse> rootComments = new ArrayList<>();
            for (CommentResponse c : flatForDisc) {
                Integer parentId = c.getParentCommentId();
                if (parentId != null && commentMap.containsKey(parentId)) {
                    commentMap.get(parentId).getReplies().add(c);
                } else {
                    rootComments.add(c);
                }
            }

            result.add(new DiscussionDetailResponse(disc, rootComments));
        }

        return result;
    }
}
