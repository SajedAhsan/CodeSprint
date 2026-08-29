package com.example.demo.dto;

import java.util.Objects;

public class UserProblemStateDto {

        private Boolean bookmark;
        private Boolean solved;
        private String note;

        public UserProblemStateDto(
                        Boolean bookmark,
                        Boolean solved,
                        String note) {
                this.bookmark = bookmark;
                this.solved = solved;
                this.note = note;
        }

        public Boolean getBookmark() {
                return bookmark;
        }

        public Boolean getSolved() {
                return solved;
        }

        public String getNote() {
                return note;
        }

        public void setBookmark(Boolean bookmark) {
                this.bookmark = bookmark;
        }

        public void setSolved(Boolean solved) {
                this.solved = solved;
        }

        public void setNote(String note) {
                this.note = note;
        }

        @Override
        public boolean equals(Object o) {
                if (this == o)
                        return true;
                if (o == null || getClass() != o.getClass())
                        return false;

                UserProblemStateDto that = (UserProblemStateDto) o;

                return Objects.equals(bookmark, that.bookmark)
                                && Objects.equals(solved, that.solved)
                                && Objects.equals(note, that.note);
        }

        @Override
        public int hashCode() {
                return Objects.hash(bookmark, solved, note);
        }

        @Override
        public String toString() {
                return "UserProblemStateDto{" +
                                "bookmark=" + bookmark +
                                ", solved=" + solved +
                                ", note='" + note + '\'' +
                                '}';
        }
}
