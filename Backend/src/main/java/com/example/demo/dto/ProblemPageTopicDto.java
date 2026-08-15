package com.example.demo.dto;

import java.util.List;

public record ProblemPageTopicDto(
        Integer topicId,
        String topicName,
        List<ProblemPageProblemDto> problems
) {}
