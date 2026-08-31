package com.example.demo.Service;

import com.example.demo.Entities.Problem;
import com.example.demo.Entities.ProblemTopic;
import com.example.demo.Entities.ProblemTopicId;
import com.example.demo.Entities.User;
import com.example.demo.Entities.Topic;
import com.example.demo.Repository.ProblemRepository;
import com.example.demo.Repository.ProblemTopicRepository;
import com.example.demo.Repository.TopicRepository;
import com.example.demo.Repository.UserRepository;
import com.example.demo.dto.ProblemRequest;
import com.example.demo.dto.ProblemResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final TopicRepository topicRepository;
    private final ProblemTopicRepository problemTopicRepository;
    private final UserRepository userRepository;
    private final com.example.demo.Service.EditorialService editorialService;

    public ProblemService(ProblemRepository problemRepository,
            TopicRepository topicRepository,
            ProblemTopicRepository problemTopicRepository,
            UserRepository userRepository,
            com.example.demo.Service.EditorialService editorialService) {
        this.problemRepository = problemRepository;
        this.topicRepository = topicRepository;
        this.problemTopicRepository = problemTopicRepository;
        this.userRepository = userRepository;
        this.editorialService = editorialService;
    }

    @Transactional(readOnly = true)
    public List<ProblemResponse> getAllProblems() {
        Map<Integer, String> topicNamesByProblemId = topicNamesByProblemId();
        return problemRepository.findAllProblems().stream()
                .map(problem -> toResponse(problem, topicNamesByProblemId.get(problem.getProblemId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProblemResponse> getMyProblems() {
        User currentUser = currentUser();
        Map<Integer, String> topicNamesByProblemId = topicNamesByProblemId();
        return problemRepository.findProblemsByAddedBy(currentUser.getUserId()).stream()
                .map(problem -> toResponse(problem, topicNamesByProblemId.get(problem.getProblemId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProblemResponse getProblemById(Integer problemId) {
        return toResponse(requireProblem(problemId), topicNameForProblem(problemId));
    }

    @Transactional
    public ProblemResponse createProblem(ProblemRequest request) {
        User currentUser = currentUser();

        Problem problem = new Problem();
        applyRequest(problem, request);
        problem.setAddedBy(currentUser.getUserId());

        Problem savedProblem = problemRepository.saveAndFlush(problem);
        Topic topic = findOrCreateTopic(request.getTopic().trim());
        linkProblemToTopic(savedProblem.getProblemId(), topic.getTopicId());

        return toResponse(savedProblem, topic.getTopicName());
    }

    @Transactional
    public ProblemResponse updateProblem(Integer problemId, ProblemRequest request) {
        Problem problem = requireProblem(problemId);
        ensureCanManage(problem);

        applyRequest(problem, request);
        problem.setAddedBy(problem.getAddedBy() == null ? currentUser().getUserId() : problem.getAddedBy());

        return toResponse(problemRepository.save(problem), topicNameForProblem(problemId));
    }

    @Transactional
    public void deleteProblem(Integer problemId) {
        Problem problem = requireProblem(problemId);
        ensureCanManage(problem);

        int deletedRows = problemRepository.deleteProblemById(problemId);
        if (deletedRows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Problem not found");
        }
    }

    private void applyRequest(Problem problem, ProblemRequest request) {
        problem.setTitle(request.getTitle().trim());
        problem.setExternalLink(request.getExternalLink() == null || request.getExternalLink().isBlank()
                ? null
                : request.getExternalLink().trim());
        problem.setDifficulty(request.getDifficulty().trim());
        problem.setConcept(request.getConcept().trim());
        problem.setIsPremium(Boolean.TRUE.equals(request.getPremium()));
    }

    private Topic findOrCreateTopic(String topicName) {
        return topicRepository.findByTopicNameIgnoreCase(topicName)
                .orElseGet(() -> {
                    Topic topic = new Topic(topicName);
                    return topicRepository.saveAndFlush(topic);
                });
    }

    private void linkProblemToTopic(Integer problemId, Integer topicId) {
        ProblemTopicId problemTopicId = new ProblemTopicId(problemId, topicId);
        problemTopicRepository.saveAndFlush(new com.example.demo.Entities.ProblemTopic(problemTopicId));
    }

    private Problem requireProblem(Integer problemId) {
        return problemRepository.findProblemById(problemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Problem not found"));
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        return userRepository.findUserByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    private void ensureCanManage(Problem problem) {
        User currentUser = currentUser();
        boolean isOwner = problem.getAddedBy() != null && problem.getAddedBy().equals(currentUser.getUserId());
        boolean isAdmin = currentUser.getRole() != null && currentUser.getRole().toUpperCase().contains("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage problems you added");
        }
    }

    private Map<Integer, String> topicNamesByProblemId() {
        Map<Integer, String> topicNamesByProblemId = new HashMap<>();
        for (ProblemTopic problemTopic : problemTopicRepository.findAll()) {
            if (problemTopic.getId() == null || problemTopic.getId().getProblemId() == null
                    || problemTopic.getId().getTopicId() == null) {
                continue;
            }

            topicRepository.findById(problemTopic.getId().getTopicId())
                    .ifPresent(topic -> topicNamesByProblemId.put(problemTopic.getId().getProblemId(),
                            topic.getTopicName()));
        }
        return topicNamesByProblemId;
    }

    private String topicNameForProblem(Integer problemId) {
        if (problemId == null) {
            return null;
        }

        return topicRepository.findAll().stream()
                .filter(topic -> problemTopicRepository.findAll().stream()
                        .anyMatch(problemTopic -> problemTopic.getId() != null
                                && problemTopic.getId().getProblemId() != null
                                && problemTopic.getId().getTopicId() != null
                                && problemTopic.getId().getProblemId().equals(problemId)
                                && problemTopic.getId().getTopicId().equals(topic.getTopicId())))
                .map(Topic::getTopicName)
                .findFirst()
                .orElse(null);
    }

    private ProblemResponse toResponse(Problem problem) {
        return toResponse(problem, null);
    }

    private ProblemResponse toResponse(Problem problem, String topicName) {
        ProblemResponse response = new ProblemResponse();
        response.setProblemId(problem.getProblemId());
        response.setTitle(problem.getTitle());
        response.setExternalLink(problem.getExternalLink());
        response.setDifficulty(problem.getDifficulty());
        response.setConcept(problem.getConcept());
        response.setTopic(topicName);
        response.setPremium(problem.getIsPremium());
        response.setAddedBy(problem.getAddedBy());
        response.setCreatedAt(problem.getCreatedAt());
        response.setUpdatedAt(problem.getUpdatedAt());
        try {
            response.setSolution(editorialService.getEditorialByProblemId(problem.getProblemId()));
        } catch (Exception ex) {
        }
        return response;
    }
}