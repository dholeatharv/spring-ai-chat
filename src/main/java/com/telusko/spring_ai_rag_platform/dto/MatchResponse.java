package com.telusko.spring_ai_rag_platform.dto;

import java.util.List;

public class MatchResponse {

    private int matchScore;                // 0-100
    private List<String> matchedSkills;    // skills found in both
    private List<String> missingSkills;    // skills needed but missing
    private List<String> recommendations;  // concrete steps to improve
    private String summary;                // short explanation

    public MatchResponse() {}

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }
}
