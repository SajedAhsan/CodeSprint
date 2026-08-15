package com.example.demo.dto;

public record UserProblemStateDto(
        Boolean bookmark,
        Boolean solved,
        String note
) {}
