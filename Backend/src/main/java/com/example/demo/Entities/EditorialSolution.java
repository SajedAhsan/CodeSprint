package com.example.demo.Entities;
import jakarta.persistence.*;

@Entity
@Table(name = "editorial_solutions")
public class EditorialSolution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer solutionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "editorial_id", nullable = false)
    private Editorial editorial;

    @Column(length = 30, nullable = false)
    private String language;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String code;

    public EditorialSolution() {
    }

    public Integer getSolutionId() {
        return solutionId;
    }

    public void setSolutionId(Integer solutionId) {
        this.solutionId = solutionId;
    }

    public Editorial getEditorial() {
        return editorial;
    }

    public void setEditorial(Editorial editorial) {
        this.editorial = editorial;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}