package com.example.demo.Controller;

import com.example.demo.Service.ProblemPageService;
import com.example.demo.dto.ProblemPageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/problems")
public class ProblemPageController {

    private final ProblemPageService problemPageService;

    public ProblemPageController(ProblemPageService problemPageService) {
        this.problemPageService = problemPageService;
    }

    @GetMapping("/page/{userId}")
    public ResponseEntity<ProblemPageResponse> getProblemPage(@PathVariable Integer userId) {
        return ResponseEntity.ok(problemPageService.getProblemPage(userId));
    }
}
