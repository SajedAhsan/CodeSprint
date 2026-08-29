package com.example.demo.dto;

import java.util.List;
import java.util.Objects;

public class ProblemPageTopicDto {

        private Integer topicId;
        private String topicName;
        private List<ProblemPageProblemDto> problems;

        public ProblemPageTopicDto(
                        Integer topicId,
                        String topicName,
                        List<ProblemPageProblemDto> problems) {
                this.topicId = topicId;
                this.topicName = topicName;
                this.problems = problems;
        }

        public Integer getTopicId() {
                return topicId;
        }

        public String getTopicName() {
                return topicName;
        }

        public List<ProblemPageProblemDto> getProblems() {
                return problems;
        }

        public void setTopicId(Integer topicId) {
                this.topicId = topicId;
        }

        public void setTopicName(String topicName) {
                this.topicName = topicName;
        }

        public void setProblems(List<ProblemPageProblemDto> problems) {
                this.problems = problems;
        }

        @Override
        public boolean equals(Object o) {
                if (this == o)
                        return true;
                if (o == null || getClass() != o.getClass())
                        return false;

                ProblemPageTopicDto that = (ProblemPageTopicDto) o;

                return Objects.equals(topicId, that.topicId)
                                && Objects.equals(topicName, that.topicName)
                                && Objects.equals(problems, that.problems);
        }

        @Override
        public int hashCode() {
                return Objects.hash(topicId, topicName, problems);
        }

        @Override
        public String toString() {
                return "ProblemPageTopicDto{" +
                                "topicId=" + topicId +
                                ", topicName='" + topicName + '\'' +
                                ", problems=" + problems +
                                '}';
        }
}
