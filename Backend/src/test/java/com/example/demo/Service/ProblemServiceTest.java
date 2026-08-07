package com.example.demo.Service;

import com.example.demo.Entities.Problem;
import com.example.demo.Entities.ProblemTopic;
import com.example.demo.Entities.ProblemTopicId;
import com.example.demo.Entities.Topic;
import com.example.demo.Repository.ProblemRepository;
import com.example.demo.Repository.ProblemTopicRepository;
import com.example.demo.Repository.TopicRepository;
import com.example.demo.Repository.UserRepository;
import com.example.demo.dto.ProblemResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProblemServiceTest {

    @Mock
    private ProblemRepository problemRepository;

    @Mock
    private TopicRepository topicRepository;

    @Mock
    private ProblemTopicRepository problemTopicRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProblemService problemService;

    @BeforeEach
    void setUp() {
        Problem problem = new Problem();
        problem.setProblemId(1);
        problem.setTitle("Test Problem");
        problem.setDifficulty("Medium");
        problem.setConcept("Greedy");
        problem.setIsPremium(false);
        problem.setAddedBy(42);
        problem.setUpdatedAt(LocalDateTime.now());

        Topic topic = new Topic();
        topic.setTopicId(7);
        topic.setTopicName("Dynamic Programming");

        ProblemTopic problemTopic = new ProblemTopic(new ProblemTopicId(1, 7));

        when(problemRepository.findAllProblems()).thenReturn(List.of(problem));
        when(problemTopicRepository.findAll()).thenReturn(List.of(problemTopic));
        when(topicRepository.findById(7)).thenReturn(Optional.of(topic));
    }

    @Test
    void getAllProblemsIncludesTopicNameFromProblemTopicMappings() {
        List<ProblemResponse> problems = problemService.getAllProblems();

        assertNotNull(problems);
        assertEquals(1, problems.size());
        assertEquals("Dynamic Programming", problems.get(0).getTopic());
    }
}
