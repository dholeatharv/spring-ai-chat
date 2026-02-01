package com.telusko.spring_ai_rag_platform.dto;

public class ChatResponse {

    private  String reply;

    public ChatResponse(String reply) {
        this.reply = reply;
    }

    public String getReply() {
        return reply;
    }
}