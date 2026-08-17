package com.example.demo.Service;

import com.example.demo.Entities.*;
import com.example.demo.Repository.*;
import com.example.demo.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
public class DiscussionService {

    private final DiscussionRepository discussionRepository;
    private final CommentRepository commentRepository;
    private final DiscussionCommentRepository discussionCommentRepository;
    private final DiscussionReactionRepository discussionReactionRepository;
    private final CommentReactionRepository commentReactionRepository;
    private final DiscussionJdbcRepository discussionJdbcRepository;
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;

    public DiscussionService(
            DiscussionRepository discussionRepository,
            CommentRepository commentRepository,
            DiscussionCommentRepository discussionCommentRepository,
            DiscussionReactionRepository discussionReactionRepository,
            CommentReactionRepository commentReactionRepository,
            DiscussionJdbcRepository discussionJdbcRepository,
            UserRepository userRepository,
            ProblemRepository problemRepository) {
        this.discussionRepository = discussionRepository;
        this.commentRepository = commentRepository;
        this.discussionCommentRepository = discussionCommentRepository;
        this.discussionReactionRepository = discussionReactionRepository;
        this.commentReactionRepository = commentReactionRepository;
        this.discussionJdbcRepository = discussionJdbcRepository;
        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
    }

    private User getAuthenticatedUser(String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        return userRepository.findUserByUsername(username.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    private Integer getUserIdOrNull(String username) {
        if (username == null || username.isBlank()) {
            return null;
        }
        return userRepository.findUserByUsername(username.trim())
                .map(User::getUserId)
                .orElse(null);
    }

    @Transactional
    public DiscussionResponse createDiscussion(Integer problemId, DiscussionRequest request, String username) {
        User user = getAuthenticatedUser(username);

        Problem problem = problemRepository.findProblemById(problemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Problem not found with id: " + problemId));

        Discussion discussion = new Discussion();
        discussion.setUser(user);
        discussion.setProblem(problem);
        discussion.setContent(request.getContent().trim());

        Discussion savedDiscussion = discussionRepository.save(discussion);

        return new DiscussionResponse(
                savedDiscussion.getDiscussionId(),
                problem.getProblemId(),
                savedDiscussion.getContent(),
                user.getUserId(),
                user.getUsername(),
                savedDiscussion.getCreatedAt(),
                savedDiscussion.getUpdatedAt(),
                0L,
                0L,
                false
        );
    }

    @Transactional(readOnly = true)
    public List<DiscussionResponse> getDiscussionsByProblem(Integer problemId, String username) {
        problemRepository.findProblemById(problemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Problem not found with id: " + problemId));

        Integer currentUserId = getUserIdOrNull(username);
        return discussionJdbcRepository.findDiscussionsByProblemId(problemId, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<DiscussionDetailResponse> getDiscussionsWithDetailsByProblem(Integer problemId, String username) {
        problemRepository.findProblemById(problemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Problem not found with id: " + problemId));

        Integer currentUserId = getUserIdOrNull(username);
        return discussionJdbcRepository.findDiscussionsWithDetailsByProblemId(problemId, currentUserId);
    }

    @Transactional(readOnly = true)
    public DiscussionDetailResponse getDiscussionById(Integer discussionId, String username) {
        Integer currentUserId = getUserIdOrNull(username);

        DiscussionResponse discussionSummary = discussionJdbcRepository
                .findDiscussionSummaryById(discussionId, currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Discussion not found with id: " + discussionId));

        List<CommentResponse> nestedComments = discussionJdbcRepository.findNestedCommentsByDiscussionId(discussionId);

        return new DiscussionDetailResponse(discussionSummary, nestedComments);
    }

    @Transactional
    public DiscussionResponse updateDiscussion(Integer discussionId, DiscussionRequest request, String username) {
        User user = getAuthenticatedUser(username);

        Discussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Discussion not found with id: " + discussionId));

        if (!discussion.getUser().getUserId().equals(user.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to update this discussion");
        }

        discussion.setContent(request.getContent().trim());
        discussionRepository.save(discussion);

        return discussionJdbcRepository
                .findDiscussionSummaryById(discussionId, user.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve updated discussion"));
    }

    @Transactional
    public void deleteDiscussion(Integer discussionId, String username) {
        User user = getAuthenticatedUser(username);

        Discussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Discussion not found with id: " + discussionId));

        boolean isOwner = discussion.getUser().getUserId().equals(user.getUserId());
        boolean isAdmin = user.getRole() != null && user.getRole().toUpperCase().contains("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete this discussion");
        }

        // Delete associated reactions
        discussionReactionRepository.deleteByDiscussionId(discussionId);

        // Find comment IDs associated with this discussion
        List<Integer> commentIds = discussionCommentRepository.findCommentIdsByDiscussionId(discussionId);

        // Delete discussion_comment mappings
        discussionCommentRepository.deleteByDiscussionId(discussionId);

        // Delete comment reactions
        if (!commentIds.isEmpty()) {
            commentReactionRepository.deleteByCommentIdIn(commentIds);
            deleteCommentsHierarchy(commentIds);
        }

        // Delete discussion
        discussionRepository.delete(discussion);
    }

    @Transactional
    public CommentResponse addComment(Integer discussionId, CommentRequest request, String username) {
        User user = getAuthenticatedUser(username);

        Discussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Discussion not found with id: " + discussionId));

        Comment parentComment = null;
        if (request.getParentCommentId() != null) {
            parentComment = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent comment not found with id: " + request.getParentCommentId()));

            // Verify parent comment belongs to the same discussion
            DiscussionComment parentDc = discussionCommentRepository.findByComment_CommentId(parentComment.getCommentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent comment does not belong to this discussion"));

            if (!parentDc.getDiscussion().getDiscussionId().equals(discussionId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent comment does not belong to this discussion");
            }
        }

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setComment(request.getContent().trim());
        comment.setParentComment(parentComment);

        Comment savedComment = commentRepository.saveAndFlush(comment);

        discussionJdbcRepository.linkCommentToDiscussion(savedComment.getCommentId(), discussion.getDiscussionId());

        return new CommentResponse(
                savedComment.getCommentId(),
                discussionId,
                savedComment.getComment(),
                user.getUserId(),
                user.getUsername(),
                parentComment != null ? parentComment.getCommentId() : null,
                savedComment.getCreatedAt(),
                savedComment.getUpdatedAt()
        );
    }

    @Transactional
    public CommentResponse replyToComment(Integer parentCommentId, CommentRequest request, String username) {
        DiscussionComment dc = discussionCommentRepository.findByComment_CommentId(parentCommentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent comment not found with id: " + parentCommentId));

        request.setParentCommentId(parentCommentId);
        return addComment(dc.getDiscussion().getDiscussionId(), request, username);
    }

    @Transactional
    public CommentResponse updateComment(Integer commentId, CommentRequest request, String username) {
        User user = getAuthenticatedUser(username);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found with id: " + commentId));

        if (!comment.getUser().getUserId().equals(user.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to update this comment");
        }

        comment.setComment(request.getContent().trim());
        Comment updatedComment = commentRepository.save(comment);

        DiscussionComment dc = discussionCommentRepository.findByComment_CommentId(commentId).orElse(null);
        Integer discussionId = dc != null ? dc.getDiscussion().getDiscussionId() : null;

        return new CommentResponse(
                updatedComment.getCommentId(),
                discussionId,
                updatedComment.getComment(),
                user.getUserId(),
                user.getUsername(),
                updatedComment.getParentComment() != null ? updatedComment.getParentComment().getCommentId() : null,
                updatedComment.getCreatedAt(),
                updatedComment.getUpdatedAt()
        );
    }

    @Transactional
    public void deleteComment(Integer commentId, String username) {
        User user = getAuthenticatedUser(username);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found with id: " + commentId));

        boolean isOwner = comment.getUser().getUserId().equals(user.getUserId());
        boolean isAdmin = user.getRole() != null && user.getRole().toUpperCase().contains("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete this comment");
        }

        // Recursively find and delete all descendants and the comment itself
        List<Integer> allDescendantIds = new ArrayList<>();
        collectDescendantCommentIds(commentId, allDescendantIds);
        allDescendantIds.add(commentId);

        // Delete comment reactions first
        commentReactionRepository.deleteByCommentIdIn(allDescendantIds);

        // Delete discussion_comment mapping first
        for (Integer id : allDescendantIds) {
            discussionCommentRepository.deleteByCommentId(id);
        }

        // Delete comments in reverse order (children before parents)
        deleteCommentsHierarchy(allDescendantIds);
    }

    @Transactional
    public DiscussionReactionResponse toggleReaction(Integer discussionId, String username) {
        User user = getAuthenticatedUser(username);

        Discussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Discussion not found with id: " + discussionId));

        DiscussionReactionId reactionId = new DiscussionReactionId(user.getUserId(), discussionId);
        Optional<DiscussionReaction> existingReaction = discussionReactionRepository.findById(reactionId);

        boolean newLikedState;
        if (existingReaction.isPresent()) {
            DiscussionReaction reaction = existingReaction.get();
            newLikedState = !Boolean.TRUE.equals(reaction.getLiked());
            reaction.setLiked(newLikedState);
            discussionReactionRepository.save(reaction);
        } else {
            newLikedState = true;
            DiscussionReaction reaction = new DiscussionReaction(reactionId, user, discussion, true);
            discussionReactionRepository.save(reaction);
        }

        long likeCount = discussionReactionRepository.countLikesByDiscussionId(discussionId);

        return new DiscussionReactionResponse(discussionId, likeCount, newLikedState);
    }

    private void collectDescendantCommentIds(Integer parentId, List<Integer> collectedIds) {
        List<Comment> children = commentRepository.findByParentComment_CommentId(parentId);
        for (Comment child : children) {
            collectDescendantCommentIds(child.getCommentId(), collectedIds);
            collectedIds.add(child.getCommentId());
        }
    }

    private void deleteCommentsHierarchy(List<Integer> commentIds) {
        // Collect comments and build dependency graph for clean bottom-up deletion
        List<Comment> comments = commentRepository.findAllById(commentIds);
        Map<Integer, List<Comment>> parentToChildren = new HashMap<>();
        for (Comment c : comments) {
            Integer parentId = c.getParentComment() != null ? c.getParentComment().getCommentId() : null;
            parentToChildren.computeIfAbsent(parentId, k -> new ArrayList<>()).add(c);
        }

        List<Comment> deletionOrder = new ArrayList<>();
        // Post-order traversal starting from roots
        Set<Integer> visited = new HashSet<>();
        for (Comment c : comments) {
            visitPostOrder(c, parentToChildren, visited, deletionOrder);
        }

        // Delete from leaves to roots
        for (Comment c : deletionOrder) {
            commentRepository.delete(c);
        }
    }

    private void visitPostOrder(Comment node, Map<Integer, List<Comment>> parentToChildren, Set<Integer> visited, List<Comment> order) {
        if (visited.contains(node.getCommentId())) {
            return;
        }
        visited.add(node.getCommentId());
        List<Comment> children = parentToChildren.getOrDefault(node.getCommentId(), Collections.emptyList());
        for (Comment child : children) {
            visitPostOrder(child, parentToChildren, visited, order);
        }
        order.add(node);
    }
}
