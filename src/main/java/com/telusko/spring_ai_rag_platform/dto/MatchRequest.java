package com.telusko.spring_ai_rag_platform.dto;

import jakarta.validation.constraints.NotBlank;

public class MatchRequest {

    @NotBlank(message = "resumeText cannot be blank")
    private String resumeText;

    @NotBlank(message = "jobDescription cannot be blank")
    private String jobDescription;

    public MatchRequest() {}

    public MatchRequest(String resumeText, String jobDescription) {
        this.resumeText = resumeText;
        this.jobDescription = jobDescription;
    }

    public String getResumeText() {
        return resumeText;
    }

    public void setResumeText(String resumeText) {
        this.resumeText = resumeText;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }
}