package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ProblemPageResponse(
        Integer userId,
        LocalDateTime generatedAt,
        List<ProblemPageTopicDto> topics
) {}
