package com.example.demo.Service;

import com.example.demo.Entities.Editorial;
import com.example.demo.Entities.EditorialSolution;
import com.example.demo.Entities.Problem;
import com.example.demo.Repository.EditorialRepository;
import com.example.demo.Repository.EditorialSolutionRepository;
import com.example.demo.Repository.ProblemRepository;
import com.example.demo.dto.EditorialResponse;
import com.example.demo.dto.EditorialSolutionRequest;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class EditorialService {

    private final EditorialRepository editorialRepository;
    private final EditorialSolutionRepository editorialSolutionRepository;
    private final ProblemRepository problemRepository;
    private final com.example.demo.Repository.AttachmentJdbcRepository attachmentJdbcRepository;

    public EditorialService(EditorialRepository editorialRepository,
                            EditorialSolutionRepository editorialSolutionRepository,
                            ProblemRepository problemRepository,
                            com.example.demo.Repository.AttachmentJdbcRepository attachmentJdbcRepository) {
        this.editorialRepository = editorialRepository;
        this.editorialSolutionRepository = editorialSolutionRepository;
        this.problemRepository = problemRepository;
        this.attachmentJdbcRepository = attachmentJdbcRepository;
    }

    @Transactional(readOnly = true)
    public EditorialResponse getEditorialByProblemId(Integer problemId) {
        Editorial editorial = editorialRepository.findByProblemId(problemId).orElse(null);
        if (editorial == null) {
            return null;
        }

        EditorialResponse resp = new EditorialResponse();
        resp.setEditorialId(editorial.getEditorialId());
        resp.setExplanation(editorial.getExplanation());
        resp.setVideoLink(editorial.getVideoLink());
        resp.setAttachments(attachmentJdbcRepository.findAttachmentsByEditorialId(editorial.getEditorialId()));

        List<EditorialSolution> solutionEntities = editorialSolutionRepository.findByEditorialId(editorial.getEditorialId());
        if (solutionEntities == null || solutionEntities.isEmpty()) {
            solutionEntities = editorial.getSolutions();
        }

        List<EditorialResponse.SolutionItem> solutions = (solutionEntities != null ? solutionEntities : java.util.Collections.<EditorialSolution>emptyList())
                .stream().map(s -> {
                    EditorialResponse.SolutionItem it = new EditorialResponse.SolutionItem();
                    it.setSolutionId(s.getSolutionId());
                    it.setLanguage(s.getLanguage());
                    it.setCode(s.getCode());
                    return it;
                }).collect(Collectors.toList());

        resp.setSolutions(solutions);
        return resp;
    }

    @Transactional
    public EditorialResponse addSolutionToProblem(Integer problemId, EditorialSolutionRequest request) {
        Problem problem = problemRepository.findProblemById(problemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Problem not found"));

        Editorial editorial = editorialRepository.findByProblemId(problemId).orElse(null);
        if (editorial == null) {
            editorial = new Editorial();
            editorial.setProblem(problem);
            editorial.setExplanation(request.getExplanation() != null ? request.getExplanation().trim() : "");
            editorial.setVideoLink(request.getVideoLink() != null && !request.getVideoLink().isBlank() ? request.getVideoLink().trim() : null);
            editorial = editorialRepository.saveAndFlush(editorial);
        } else {
            if (request.getExplanation() != null && !request.getExplanation().isBlank()) {
                editorial.setExplanation(request.getExplanation().trim());
            }
            if (request.getVideoLink() != null && !request.getVideoLink().isBlank()) {
                editorial.setVideoLink(request.getVideoLink().trim());
            }
            editorial = editorialRepository.saveAndFlush(editorial);
        }

        String reqLanguage = request.getLanguage() == null ? "" : request.getLanguage().trim();
        if (!reqLanguage.isBlank()) {
            List<EditorialSolution> existingSolutions = editorialSolutionRepository.findByEditorialIdAndLanguage(editorial.getEditorialId(), reqLanguage);
            EditorialSolution solution;
            if (existingSolutions != null && !existingSolutions.isEmpty()) {
                solution = existingSolutions.get(0);
                solution.setCode(request.getCode() == null ? "" : request.getCode());
            } else {
                solution = new EditorialSolution();
                solution.setEditorial(editorial);
                solution.setLanguage(reqLanguage);
                solution.setCode(request.getCode() == null ? "" : request.getCode());
            }
            editorialSolutionRepository.saveAndFlush(solution);
        }

        return getEditorialByProblemId(problemId);
    }
}
