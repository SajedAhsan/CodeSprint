package com.example.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.Entities.UserProblem;
import com.example.demo.Entities.UserProblemId;

@Repository
public interface UserProblemRepository
        extends JpaRepository<UserProblem, UserProblemId> {
}