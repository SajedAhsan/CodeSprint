package com.example.demo.Controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.Entities.UserProblem;
import com.example.demo.Service.UserProblemService;

@RestController
@RequestMapping("/api/user-problems")
public class UserProblemController {

    private final UserProblemService userProblemService;

    public UserProblemController(
            UserProblemService userProblemService
    ) {
        this.userProblemService = userProblemService;
    }

    @PutMapping("/{userId}/{problemId}")
    public ResponseEntity<UserProblem> saveUserProblem(
            @PathVariable Integer userId,
            @PathVariable Integer problemId,
            @RequestBody UserProblem userProblem
    ) {

        UserProblem savedUserProblem =
                userProblemService.saveUserProblem(
                        userId,
                        problemId,
                        userProblem
                );

        return ResponseEntity.ok(savedUserProblem);
    }

    @GetMapping("/{userId}/{problemId}")
    public ResponseEntity<UserProblem> getUserProblem(
            @PathVariable Integer userId,
            @PathVariable Integer problemId
    ) {

        UserProblem userProblem =
                userProblemService.getUserProblem(
                        userId,
                        problemId
                );

        return ResponseEntity.ok(userProblem);
    }

    @DeleteMapping("/{userId}/{problemId}")
    public ResponseEntity<Void> deleteUserProblem(
            @PathVariable Integer userId,
            @PathVariable Integer problemId
    ) {

        userProblemService.deleteUserProblem(
                userId,
                problemId
        );

        return ResponseEntity.noContent().build();
    }
}