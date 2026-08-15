package com.example.demo.dto;

public record ProblemPageProblemDto(
        Integer problemId,
        String title,
        String description,
        String difficulty,
        UserProblemStateDto userState
) {}
