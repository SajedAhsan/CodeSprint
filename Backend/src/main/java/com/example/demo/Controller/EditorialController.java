package com.example.demo.Controller;

import com.example.demo.Service.EditorialService;
import com.example.demo.dto.EditorialResponse;
import com.example.demo.dto.EditorialSolutionRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/editorials")
public class EditorialController {

    private final EditorialService editorialService;

    public EditorialController(EditorialService editorialService) {
        this.editorialService = editorialService;
    }

    @GetMapping("/problem/{problemId}")
    public ResponseEntity<EditorialResponse> getByProblem(@PathVariable Integer problemId) {
        EditorialResponse resp = editorialService.getEditorialByProblemId(problemId);
        if (resp == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{problemId}/solutions")
    public ResponseEntity<?> addSolution(@PathVariable Integer problemId,
                                         @RequestBody EditorialSolutionRequest request) {
        try {
            EditorialResponse resp = editorialService.addSolutionToProblem(problemId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("message", e.getMessage() != null ? e.getMessage() : e.getClass().getName()));
        }
    }
}
