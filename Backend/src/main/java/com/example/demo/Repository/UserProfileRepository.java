package com.example.demo.Repository;

import com.example.demo.dto.ProfileSolvesDto;
import com.example.demo.dto.UserProfileDto;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Repository
public class UserProfileRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserProfileRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<UserProfileDto> findProfileByUserId(Integer userId) {
        if (userId == null) {
            return Optional.empty();
        }

        String userSql = "SELECT user_id, username, role, is_premium FROM users WHERE user_id = ?";
        return queryProfile(userSql, userId);
    }

    public Optional<UserProfileDto> findProfileByUsername(String username) {
        if (username == null || username.isBlank()) {
            return Optional.empty();
        }

        String userSql = "SELECT user_id, username, role, is_premium FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1";
        return queryProfile(userSql, username.trim());
    }

    private Optional<UserProfileDto> queryProfile(String userSql, Object param) {
        try {
            return jdbcTemplate.queryForObject(userSql, (rs, rowNum) -> {
                int userId = rs.getInt("user_id");
                String username = rs.getString("username");
                String role = rs.getString("role");
                boolean isPremium = rs.getBoolean("is_premium");

                long blogLikes = count(
                        "SELECT COUNT(*) FROM blog_reaction br INNER JOIN blog b ON b.blog_id = br.blog_id WHERE b.user_id = ? AND br.liked = 1",
                        userId);

                long commentLikes = count(
                        "SELECT COUNT(*) FROM comment_reaction cr INNER JOIN comment c ON c.comment_id = cr.comment_id WHERE c.user_id = ? AND cr.liked = 1",
                        userId);

                long totalLikes = blogLikes + commentLikes;

                long upvotes = count(
                        "SELECT COUNT(*) FROM discussion_reaction dr INNER JOIN discussion d ON d.discussion_id = dr.discussion_id WHERE d.user_id = ? AND dr.liked = 1",
                        userId);

                Map<String, Long> solvesByDiff = new HashMap<>();
                String solvesSql = """
                        SELECT UPPER(TRIM(COALESCE(p.difficulty, 'MEDIUM'))) AS diff, COUNT(DISTINCT up.problem_id) AS cnt
                        FROM user_problem up
                        INNER JOIN problem p ON p.problem_id = up.problem_id
                        WHERE up.user_id = ? AND up.solved = 1
                        GROUP BY UPPER(TRIM(COALESCE(p.difficulty, 'MEDIUM')))
                        """;

                jdbcTemplate.query(solvesSql, diffRs -> {
                    String diff = diffRs.getString("diff");
                    long cnt = diffRs.getLong("cnt");
                    if (diff != null) {
                        solvesByDiff.put(diff, cnt);
                    }
                }, userId);

                long easy = solvesByDiff.getOrDefault("EASY", 0L);
                long medium = solvesByDiff.getOrDefault("MEDIUM", 0L);
                long hard = solvesByDiff.getOrDefault("HARD", 0L);
                long totalSolved = easy + medium + hard;

                long totalProblems = count("SELECT COUNT(*) FROM problem");

                ProfileSolvesDto solves = new ProfileSolvesDto(easy, medium, hard);

                return Optional.of(new UserProfileDto(
                        userId,
                        username,
                        role,
                        isPremium,
                        totalLikes,
                        upvotes,
                        solves,
                        totalSolved,
                        totalProblems));
            }, param);
        } catch (EmptyResultDataAccessException ex) {
            return Optional.empty();
        }
    }

    private long count(String sql, Object... params) {
        Long result = jdbcTemplate.queryForObject(sql, Long.class, params);
        return result != null ? result : 0L;
    }
}
