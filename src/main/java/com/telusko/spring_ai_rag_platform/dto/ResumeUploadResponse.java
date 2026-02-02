package com.telusko.spring_ai_rag_platform.dto;

public class ResumeUploadResponse {
    private String fileName;
    private String contentType;
    private long size;
    private String resumeText;

    public ResumeUploadResponse() {}

    public ResumeUploadResponse(String fileName, String contentType, long size, String resumeText) {
        this.fileName = fileName;
        this.contentType = contentType;
        this.size = size;
        this.resumeText = resumeText;
    }

    public String getFileName() { return fileName; }
    public String getContentType() { return contentType; }
    public long getSize() { return size; }
    public String getResumeText() { return resumeText; }

    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public void setSize(long size) { this.size = size; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }
}
