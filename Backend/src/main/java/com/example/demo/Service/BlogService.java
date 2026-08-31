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
public class BlogService {

    private final BlogRepository blogRepository;
    private final BlogCommentRepository blogCommentRepository;
    private final BlogReactionRepository blogReactionRepository;
    private final CommentReactionRepository commentReactionRepository;
    private final CommentRepository commentRepository;
    private final BlogJdbcRepository blogJdbcRepository;
    private final UserRepository userRepository;

    public BlogService(
            BlogRepository blogRepository,
            BlogCommentRepository blogCommentRepository,
            BlogReactionRepository blogReactionRepository,
            CommentReactionRepository commentReactionRepository,
            CommentRepository commentRepository,
            BlogJdbcRepository blogJdbcRepository,
            UserRepository userRepository) {
        this.blogRepository = blogRepository;
        this.blogCommentRepository = blogCommentRepository;
        this.blogReactionRepository = blogReactionRepository;
        this.commentReactionRepository = commentReactionRepository;
        this.commentRepository = commentRepository;
        this.blogJdbcRepository = blogJdbcRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        return userRepository.findUserByUsername(username.trim())
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    private Integer getUserIdOrNull(String username) {
        if (username == null || username.isBlank() || "anonymousUser".equalsIgnoreCase(username)) {
            return null;
        }
        return userRepository.findUserByUsername(username.trim())
                .map(User::getUserId)
                .orElse(null);
    }

    @Transactional
    public BlogResponse createBlog(BlogRequest request, String username) {
        User user = getAuthenticatedUser(username);

        Blog blog = new Blog();
        blog.setUser(user);
        blog.setTitle(request.getTitle().trim());
        blog.setContent(request.getContent().trim());

        Blog savedBlog = blogRepository.save(blog);

        return new BlogResponse(
                savedBlog.getBlogId(),
                savedBlog.getTitle(),
                savedBlog.getContent(),
                user.getUserId(),
                user.getUsername(),
                savedBlog.getCreatedAt(),
                savedBlog.getUpdatedAt(),
                0L,
                0L,
                false);
    }

    @Transactional(readOnly = true)
    public List<BlogResponse> getAllBlogs(String username) {
        Integer currentUserId = getUserIdOrNull(username);
        return blogJdbcRepository.findAllBlogs(currentUserId);
    }

    @Transactional(readOnly = true)
    public BlogDetailResponse getBlogById(Integer blogId, String username) {
        Integer currentUserId = getUserIdOrNull(username);

        BlogResponse blogSummary = blogJdbcRepository
                .findBlogSummaryById(blogId, currentUserId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found with id: " + blogId));

        List<CommentResponse> nestedComments = blogJdbcRepository.findNestedCommentsByBlogId(blogId, currentUserId);

        return new BlogDetailResponse(blogSummary, nestedComments);
    }

    @Transactional
    public BlogResponse updateBlog(Integer blogId, BlogRequest request, String username) {
        User user = getAuthenticatedUser(username);

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found with id: " + blogId));

        if (!blog.getUser().getUserId().equals(user.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to update this blog");
        }

        blog.setTitle(request.getTitle().trim());
        blog.setContent(request.getContent().trim());
        blogRepository.save(blog);

        return blogJdbcRepository
                .findBlogSummaryById(blogId, user.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Failed to retrieve updated blog"));
    }

    @Transactional
    public void deleteBlog(Integer blogId, String username) {
        User user = getAuthenticatedUser(username);

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found with id: " + blogId));

        boolean isOwner = blog.getUser().getUserId().equals(user.getUserId());
        boolean isAdmin = user.getRole() != null && user.getRole().toUpperCase().contains("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete this blog");
        }

        blogReactionRepository.deleteByBlogId(blogId);

        List<Integer> commentIds = blogCommentRepository.findCommentIdsByBlogId(blogId);
        blogCommentRepository.deleteByBlogId(blogId);

        if (!commentIds.isEmpty()) {
            commentReactionRepository.deleteByCommentIdIn(commentIds);
            deleteCommentsHierarchy(commentIds);
        }

        blogRepository.delete(blog);
    }

    @Transactional
    public CommentResponse addComment(Integer blogId, CommentRequest request, String username) {
        User user = getAuthenticatedUser(username);

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found with id: " + blogId));

        Comment parentComment = null;
        if (request.getParentCommentId() != null) {
            parentComment = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Parent comment not found with id: " + request.getParentCommentId()));

            BlogComment parentBc = blogCommentRepository.findByComment_CommentId(parentComment.getCommentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Parent comment does not belong to this blog"));

            if (!parentBc.getBlog().getBlogId().equals(blogId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Parent comment does not belong to this blog");
            }
        }

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setComment(request.getContent().trim());
        comment.setParentComment(parentComment);

        Comment savedComment = commentRepository.saveAndFlush(comment);

        blogJdbcRepository.linkCommentToBlog(savedComment.getCommentId(), blog.getBlogId());

        return new CommentResponse(
                savedComment.getCommentId(),
                null,
                blogId,
                savedComment.getComment(),
                user.getUserId(),
                user.getUsername(),
                parentComment != null ? parentComment.getCommentId() : null,
                savedComment.getCreatedAt(),
                savedComment.getUpdatedAt(),
                0L,
                false);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByBlog(Integer blogId, String username) {
        blogRepository.findById(blogId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found with id: " + blogId));

        Integer currentUserId = getUserIdOrNull(username);
        return blogJdbcRepository.findNestedCommentsByBlogId(blogId, currentUserId);
    }

    @Transactional
    public CommentResponse replyToComment(Integer parentCommentId, CommentRequest request, String username) {
        BlogComment bc = blogCommentRepository.findByComment_CommentId(parentCommentId).orElse(null);
        if (bc != null) {
            request.setParentCommentId(parentCommentId);
            return addComment(bc.getBlog().getBlogId(), request, username);
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent comment not found with id: " + parentCommentId);
    }

    @Transactional
    public CommentResponse updateComment(Integer commentId, CommentRequest request, String username) {
        User user = getAuthenticatedUser(username);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Comment not found with id: " + commentId));

        if (!comment.getUser().getUserId().equals(user.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have permission to update this comment");
        }

        comment.setComment(request.getContent().trim());
        Comment updatedComment = commentRepository.save(comment);

        BlogComment bc = blogCommentRepository.findByComment_CommentId(commentId).orElse(null);
        Integer blogId = bc != null ? bc.getBlog().getBlogId() : null;

        long likeCount = commentReactionRepository.countLikesByCommentId(commentId);
        boolean isLiked = commentReactionRepository.findByUserIdAndCommentId(user.getUserId(), commentId)
                .map(CommentReaction::getLiked)
                .orElse(false);

        return new CommentResponse(
                updatedComment.getCommentId(),
                null,
                blogId,
                updatedComment.getComment(),
                user.getUserId(),
                user.getUsername(),
                updatedComment.getParentComment() != null ? updatedComment.getParentComment().getCommentId() : null,
                updatedComment.getCreatedAt(),
                updatedComment.getUpdatedAt(),
                likeCount,
                isLiked);
    }

    @Transactional
    public void deleteComment(Integer commentId, String username) {
        User user = getAuthenticatedUser(username);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Comment not found with id: " + commentId));

        boolean isOwner = comment.getUser().getUserId().equals(user.getUserId());
        boolean isAdmin = user.getRole() != null && user.getRole().toUpperCase().contains("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have permission to delete this comment");
        }

        List<Integer> allDescendantIds = new ArrayList<>();
        collectDescendantCommentIds(commentId, allDescendantIds);
        allDescendantIds.add(commentId);

        commentReactionRepository.deleteByCommentIdIn(allDescendantIds);

        for (Integer id : allDescendantIds) {
            blogCommentRepository.deleteByCommentId(id);
        }

        deleteCommentsHierarchy(allDescendantIds);
    }

    @Transactional
    public BlogReactionResponse toggleBlogReaction(Integer blogId, String username) {
        User user = getAuthenticatedUser(username);

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found with id: " + blogId));

        BlogReactionId reactionId = new BlogReactionId(user.getUserId(), blogId);
        Optional<BlogReaction> existingReaction = blogReactionRepository.findById(reactionId);

        boolean newLikedState;
        if (existingReaction.isPresent()) {
            BlogReaction reaction = existingReaction.get();
            newLikedState = !Boolean.TRUE.equals(reaction.getLiked());
            reaction.setLiked(newLikedState);
            blogReactionRepository.save(reaction);
        } else {
            newLikedState = true;
            BlogReaction reaction = new BlogReaction(reactionId, user, blog, true);
            blogReactionRepository.save(reaction);
        }

        long likeCount = blogReactionRepository.countLikesByBlogId(blogId);

        return new BlogReactionResponse(blogId, likeCount, newLikedState);
    }

    @Transactional
    public CommentReactionResponse toggleCommentReaction(Integer commentId, String username) {
        User user = getAuthenticatedUser(username);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Comment not found with id: " + commentId));

        CommentReactionId reactionId = new CommentReactionId(user.getUserId(), commentId);
        Optional<CommentReaction> existingReaction = commentReactionRepository.findById(reactionId);

        boolean newLikedState;
        if (existingReaction.isPresent()) {
            CommentReaction reaction = existingReaction.get();
            newLikedState = !Boolean.TRUE.equals(reaction.getLiked());
            reaction.setLiked(newLikedState);
            commentReactionRepository.save(reaction);
        } else {
            newLikedState = true;
            CommentReaction reaction = new CommentReaction(reactionId, user, comment, true);
            commentReactionRepository.save(reaction);
        }

        long likeCount = commentReactionRepository.countLikesByCommentId(commentId);

        return new CommentReactionResponse(commentId, likeCount, newLikedState);
    }

    private void collectDescendantCommentIds(Integer parentId, List<Integer> collectedIds) {
        List<Comment> children = commentRepository.findByParentComment_CommentId(parentId);
        for (Comment child : children) {
            collectDescendantCommentIds(child.getCommentId(), collectedIds);
            collectedIds.add(child.getCommentId());
        }
    }

    private void deleteCommentsHierarchy(List<Integer> commentIds) {
        List<Comment> comments = commentRepository.findAllById(commentIds);
        Map<Integer, List<Comment>> parentToChildren = new HashMap<>();
        for (Comment c : comments) {
            Integer parentId = c.getParentComment() != null ? c.getParentComment().getCommentId() : null;
            parentToChildren.computeIfAbsent(parentId, k -> new ArrayList<>()).add(c);
        }

        List<Comment> deletionOrder = new ArrayList<>();
        Set<Integer> visited = new HashSet<>();
        for (Comment c : comments) {
            visitPostOrder(c, parentToChildren, visited, deletionOrder);
        }

        for (Comment c : deletionOrder) {
            commentRepository.delete(c);
        }
    }

    private void visitPostOrder(Comment node, Map<Integer, List<Comment>> parentToChildren, Set<Integer> visited,
            List<Comment> order) {
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
