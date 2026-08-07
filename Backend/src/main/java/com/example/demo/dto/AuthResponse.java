package com.example.demo.dto;

public class AuthResponse {

    private String message;
    private String token;
    private Integer userId;
    private String username;

    public AuthResponse() {
    }

    public AuthResponse(String message, String token, Integer userId, String username) {
        this.message = message;
        this.token = token;
        this.userId = userId;
        this.username = username;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}