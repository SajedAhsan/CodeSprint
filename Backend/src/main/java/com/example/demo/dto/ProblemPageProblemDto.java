package com.example.demo.dto;

import java.util.Objects;

public class ProblemPageProblemDto {

        private Integer problemId;
        private String title;
        private String description;
        private String difficulty;
        private String externalLink;
        private UserProblemStateDto userState;

        public ProblemPageProblemDto(
                        Integer problemId,
                        String title,
                        String description,
                        String difficulty,
                        String externalLink,
                        UserProblemStateDto userState) {
                this.problemId = problemId;
                this.title = title;
                this.description = description;
                this.difficulty = difficulty;
                this.externalLink = externalLink;
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

        public String getExternalLink() {
                return externalLink;
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

        public void setExternalLink(String externalLink) {
                this.externalLink = externalLink;
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
                                && Objects.equals(externalLink, that.externalLink)
                                && Objects.equals(userState, that.userState);
        }

        @Override
        public int hashCode() {
                return Objects.hash(
                                problemId,
                                title,
                                description,
                                difficulty,
                                externalLink,
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
                                ", externalLink='" + externalLink + '\'' +
                                ", userState=" + userState +
                                '}';
        }
}
