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

    public EditorialService(EditorialRepository editorialRepository,
                            EditorialSolutionRepository editorialSolutionRepository,
                            ProblemRepository problemRepository) {
        this.editorialRepository = editorialRepository;
        this.editorialSolutionRepository = editorialSolutionRepository;
        this.problemRepository = problemRepository;
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

        List<EditorialResponse.SolutionItem> solutions = editorial.getSolutions().stream().map(s -> {
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

        Editorial editorial = editorialRepository.findByProblemId(problemId).orElseGet(() -> {
            Editorial e = new Editorial();
            e.setProblem(problem);
            e.setExplanation("");
            return editorialRepository.saveAndFlush(e);
        });

        // update editorial explanation/video if provided
        if (request.getExplanation() != null && !request.getExplanation().isBlank()) {
            editorial.setExplanation(request.getExplanation());
        }
        if (request.getVideoLink() != null && !request.getVideoLink().isBlank()) {
            editorial.setVideoLink(request.getVideoLink());
        }
        editorial = editorialRepository.saveAndFlush(editorial);

        String reqLanguage = request.getLanguage() == null ? "" : request.getLanguage().trim();
        EditorialSolution existingSolution = editorial.getSolutions().stream()
                .filter(s -> s.getLanguage().equalsIgnoreCase(reqLanguage))
                .findFirst()
                .orElse(null);

        if (existingSolution != null) {
            existingSolution.setCode(request.getCode() == null ? "" : request.getCode());
            editorialSolutionRepository.save(existingSolution);
        } else {
            EditorialSolution solution = new EditorialSolution();
            solution.setEditorial(editorial);
            solution.setLanguage(reqLanguage);
            solution.setCode(request.getCode() == null ? "" : request.getCode());

            editorial.getSolutions().add(solution);
            editorialSolutionRepository.save(solution);
        }

        return getEditorialByProblemId(problemId);
    }
}
