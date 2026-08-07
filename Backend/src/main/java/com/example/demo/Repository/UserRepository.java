package com.example.demo.Repository;

import com.example.demo.Entities.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Integer> {

    @Query(value = "SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER(:username)", nativeQuery = true)
    Long countUsersByUsername(@Param("username") String username);

    @Query(value = "SELECT * FROM users WHERE LOWER(username) = LOWER(:username) LIMIT 1", nativeQuery = true)
    Optional<User> findUserByUsername(@Param("username") String username);
}