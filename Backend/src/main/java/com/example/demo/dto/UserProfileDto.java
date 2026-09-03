package com.example.demo.dto;

public record UserProfileDto(
        Integer userId,
        String username,
        String role,
        Boolean isPremium,
        long totalLikes,
        long upvotes,
        ProfileSolvesDto solves,
        long totalSolved,
        long totalProblems
) {}
