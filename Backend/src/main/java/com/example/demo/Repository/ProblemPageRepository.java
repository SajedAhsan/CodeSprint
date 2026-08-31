package com.example.demo.Repository;

import com.example.demo.dto.ProblemPageProblemDto;
import com.example.demo.dto.ProblemPageResponse;
import com.example.demo.dto.ProblemPageTopicDto;
import com.example.demo.dto.UserProblemStateDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class ProblemPageRepository {

        private final JdbcTemplate jdbcTemplate;

        public ProblemPageRepository(JdbcTemplate jdbcTemplate) {
                this.jdbcTemplate = jdbcTemplate;
        }

        public ProblemPageResponse findProblemPageByUserId(Integer userId) {

                String sql = """
                                SELECT
                                    t.topic_id,
                                    t.topic_name,

                                    p.problem_id,
                                    p.title,
                                    COALESCE(p.concept, '') AS description,
                                    UPPER(COALESCE(p.difficulty, 'MEDIUM')) AS difficulty,

                                    up.user_id AS state_user_id,
                                    up.bookmark,
                                    up.solved,
                                    up.note

                                FROM topic t

                                INNER JOIN problem_topic pt
                                    ON pt.topic_id = t.topic_id

                                INNER JOIN problem p
                                    ON p.problem_id = pt.problem_id

                                LEFT JOIN user_problem up
                                    ON up.problem_id = p.problem_id
                                   AND up.user_id = ?

                                ORDER BY
                                    t.topic_id,
                                    p.problem_id
                                """;

                List<ProblemPageRow> rows = jdbcTemplate.query(
                                sql,
                                (rs, rowNum) -> new ProblemPageRow(
                                                rs.getInt("topic_id"),
                                                rs.getString("topic_name"),

                                                rs.getInt("problem_id"),
                                                rs.getString("title"),
                                                rs.getString("description"),
                                                rs.getString("difficulty"),

                                                (Integer) rs.getObject("state_user_id"),
                                                (Boolean) rs.getObject("bookmark"),
                                                (Boolean) rs.getObject("solved"),
                                                rs.getString("note")),
                                userId);

                Map<Integer, List<ProblemPageProblemDto>> problemsByTopicId = new LinkedHashMap<>();

                Map<Integer, String> topicNameByTopicId = new LinkedHashMap<>();

                for (ProblemPageRow row : rows) {

                        topicNameByTopicId.putIfAbsent(
                                        row.topicId(),
                                        row.topicName());

                        UserProblemStateDto userState = null;

                        if (row.stateUserId() != null) {

                                userState = new UserProblemStateDto(
                                                row.bookmark(),
                                                row.solved(),
                                                row.note());
                        }

                        ProblemPageProblemDto problem = new ProblemPageProblemDto(
                                        row.problemId(),
                                        row.title(),
                                        row.description(),
                                        row.difficulty(),
                                        userState);

                        problemsByTopicId
                                        .computeIfAbsent(
                                                        row.topicId(),
                                                        key -> new ArrayList<>())
                                        .add(problem);
                }

                List<ProblemPageTopicDto> topics = new ArrayList<>();

                for (Map.Entry<Integer, List<ProblemPageProblemDto>> entry : problemsByTopicId.entrySet()) {

                        Integer topicId = entry.getKey();

                        topics.add(
                                        new ProblemPageTopicDto(
                                                        topicId,
                                                        topicNameByTopicId.get(topicId),
                                                        entry.getValue()));
                }

                return new ProblemPageResponse(
                                userId,
                                LocalDateTime.now(),
                                topics);
        }

        private record ProblemPageRow(
                        Integer topicId,
                        String topicName,

                        Integer problemId,
                        String title,
                        String description,
                        String difficulty,

                        Integer stateUserId,
                        Boolean bookmark,
                        Boolean solved,
                        String note) {
        }
}