package com.example.demo.Controller;

import com.example.demo.Service.ProblemService;
import com.example.demo.dto.ProblemRequest;
import com.example.demo.dto.ProblemResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    @GetMapping
    public ResponseEntity<List<ProblemResponse>> getAllProblems() {
        return ResponseEntity.ok(problemService.getAllProblems());
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ProblemResponse>> getMyProblems() {
        return ResponseEntity.ok(problemService.getMyProblems());
    }

    @GetMapping("/{problemId}")
    public ResponseEntity<ProblemResponse> getProblemById(@PathVariable Integer problemId) {
        return ResponseEntity.ok(problemService.getProblemById(problemId));
    }

    @PostMapping
    public ResponseEntity<ProblemResponse> createProblem(@Valid @RequestBody ProblemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(problemService.createProblem(request));
    }

    @PutMapping("/{problemId}")
    public ResponseEntity<ProblemResponse> updateProblem(@PathVariable Integer problemId,
                                                         @Valid @RequestBody ProblemRequest request) {
        return ResponseEntity.ok(problemService.updateProblem(problemId, request));
    }

    @DeleteMapping("/{problemId}")
    public ResponseEntity<Void> deleteProblem(@PathVariable Integer problemId) {
        problemService.deleteProblem(problemId);
        return ResponseEntity.noContent().build();
    }
}