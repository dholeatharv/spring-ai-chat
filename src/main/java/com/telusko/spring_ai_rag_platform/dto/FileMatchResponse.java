package com.telusko.spring_ai_rag_platform.dto;


public class FileMatchResponse {

    private MatchResponse match;
    private String resumeFileName;
    private String jobFileName;

    public FileMatchResponse(MatchResponse match, String resumeFileName, String jobFileName) {
        this.match = match;
        this.resumeFileName = resumeFileName;
        this.jobFileName = jobFileName;
    }

    public MatchResponse getMatch() {
        return match;
    }

    public String getResumeFileName() {
        return resumeFileName;
    }

    public String getJobFileName() {
        return jobFileName;
    }
}
