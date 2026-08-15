package com.example.demo.Service;

import com.example.demo.Repository.ProblemPageRepository;
import com.example.demo.dto.ProblemPageResponse;
import org.springframework.stereotype.Service;

@Service
public class ProblemPageService {

    private final ProblemPageRepository problemPageRepository;

    public ProblemPageService(ProblemPageRepository problemPageRepository) {
        this.problemPageRepository = problemPageRepository;
    }

    public ProblemPageResponse getProblemPage(Integer userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required");
        }

        return problemPageRepository.findProblemPageByUserId(userId);
    }
}
