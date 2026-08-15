package com.example.demo.Service;

import com.example.demo.Entities.Problem;
import com.example.demo.Entities.User;
import com.example.demo.Entities.UserProblem;
import com.example.demo.Entities.UserProblemId;
import com.example.demo.Repository.ProblemRepository;
import com.example.demo.Repository.UserProblemRepository;
import com.example.demo.Repository.UserRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

@Service
public class UserProblemService {

    private final UserProblemRepository userProblemRepository;
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;

    public UserProblemService(
            UserProblemRepository userProblemRepository,
            UserRepository userRepository,
            ProblemRepository problemRepository
    ) {
        this.userProblemRepository = userProblemRepository;
        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
    }

    public UserProblem saveUserProblem(
            Integer userId,
            Integer problemId,
            UserProblem userProblem
    ) {
        UserProblemId id = new UserProblemId(userId, problemId);

        UserProblem existing = userProblemRepository.findById(id).orElse(null);

        if (existing == null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Problem problem = problemRepository.findById(problemId)
                    .orElseThrow(() -> new RuntimeException("Problem not found"));

            userProblem.setId(id);
            userProblem.setUser(user);
            userProblem.setProblem(problem);

            if (userProblem.getBookmark() == null) {
                userProblem.setBookmark(false);
            }

            if (userProblem.getSolved() == null) {
                userProblem.setSolved(false);
            }

            if (Boolean.TRUE.equals(userProblem.getSolved())) {
                userProblem.setSolvedAt(LocalDateTime.now());
            }

            userProblem.setUpdatedAt(LocalDateTime.now());
            return userProblemRepository.save(userProblem);
        }

        boolean wasSolved = Boolean.TRUE.equals(existing.getSolved());
        boolean isSolved = Boolean.TRUE.equals(userProblem.getSolved());

        existing.setNote(userProblem.getNote());
        existing.setBookmark(userProblem.getBookmark());
        existing.setSolved(userProblem.getSolved());

        if (!wasSolved && isSolved) {
            existing.setSolvedAt(LocalDateTime.now());
        }

        if (wasSolved && !isSolved) {
            existing.setSolvedAt(null);
        }

        existing.setUpdatedAt(LocalDateTime.now());
        return userProblemRepository.save(existing);
    }

    public UserProblem getUserProblem(Integer userId, Integer problemId) {
        UserProblemId id = new UserProblemId(userId, problemId);
        return userProblemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User problem not found"));
    }

    public void deleteUserProblem(Integer userId, Integer problemId) {
        UserProblemId id = new UserProblemId(userId, problemId);

        if (!userProblemRepository.existsById(id)) {
            throw new RuntimeException("User problem not found");
        }

        userProblemRepository.deleteById(id);
    }
}
