package com.example.demo.dto;

import java.util.Objects;

public class ProblemPageProblemDto {

        private Integer problemId;
        private String title;
        private String description;
        private String difficulty;
        private UserProblemStateDto userState;

        public ProblemPageProblemDto(
                        Integer problemId,
                        String title,
                        String description,
                        String difficulty,
                        UserProblemStateDto userState) {
                this.problemId = problemId;
                this.title = title;
                this.description = description;
                this.difficulty = difficulty;
                this.userState = userState;
        }

        public Integer getProblemId() {
                return problemId;
        }

        public String getTitle() {
                return title;
        }

        public String getDescription() {
                return description;
        }

        public String getDifficulty() {
                return difficulty;
        }

        public UserProblemStateDto getUserState() {
                return userState;
        }

        public void setProblemId(Integer problemId) {
                this.problemId = problemId;
        }

        public void setTitle(String title) {
                this.title = title;
        }

        public void setDescription(String description) {
                this.description = description;
        }

        public void setDifficulty(String difficulty) {
                this.difficulty = difficulty;
        }

        public void setUserState(UserProblemStateDto userState) {
                this.userState = userState;
        }

        @Override
        public boolean equals(Object o) {
                if (this == o)
                        return true;
                if (o == null || getClass() != o.getClass())
                        return false;

                ProblemPageProblemDto that = (ProblemPageProblemDto) o;

                return Objects.equals(problemId, that.problemId)
                                && Objects.equals(title, that.title)
                                && Objects.equals(description, that.description)
                                && Objects.equals(difficulty, that.difficulty)
                                && Objects.equals(userState, that.userState);
        }

        @Override
        public int hashCode() {
                return Objects.hash(
                                problemId,
                                title,
                                description,
                                difficulty,
                                userState);
        }

        // toString()
        @Override
        public String toString() {
                return "ProblemPageProblemDto{" +
                                "problemId=" + problemId +
                                ", title='" + title + '\'' +
                                ", description='" + description + '\'' +
                                ", difficulty='" + difficulty + '\'' +
                                ", userState=" + userState +
                                '}';
        }
}
