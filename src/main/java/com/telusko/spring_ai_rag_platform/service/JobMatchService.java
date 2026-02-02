package com.telusko.spring_ai_rag_platform.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.telusko.spring_ai_rag_platform.dto.MatchRequest;
import com.telusko.spring_ai_rag_platform.dto.MatchResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class JobMatchService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public JobMatchService(ChatClient.Builder chatClientBuilder, ObjectMapper objectMapper) {
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public MatchResponse match(MatchRequest request) {
        String prompt = buildPrompt(request.getResumeText(), request.getJobDescription());

        String raw = chatClient.prompt()
                .user(prompt)
                .call()
                .content();

        // Convert model JSON string -> MatchResponse
        return parseJson(raw);
    }

    private MatchResponse parseJson(String raw) {
        try {
            return objectMapper.readValue(raw, MatchResponse.class);
        } catch (Exception e) {
            // If model returns non-JSON sometimes, fail with a clear message
            throw new IllegalStateException(
                    "Model returned invalid JSON. Raw output was:\n" + raw, e
            );
        }
    }

    private String buildPrompt(String resumeText, String jdText) {
        return """
        You are an ATS-style job matcher.

        Task:
        Compare the RESUME and JOB_DESCRIPTION.
        Return ONLY valid JSON (no markdown, no extra text).

        JSON schema:
        {
          "matchScore": 0-100,
          "matchedSkills": ["..."],
          "missingSkills": ["..."],
          "recommendations": ["..."],
          "summary": "..."
        }

        Rules:
        - matchScore must be an integer 0..100
        - matchedSkills and missingSkills must be unique, short phrases
        - recommendations must be actionable and specific
        - summary max 3 sentences
        - Output MUST be valid JSON ONLY.

        RESUME:
        %s

        JOB_DESCRIPTION:
        %s
        """.formatted(resumeText, jdText);
    }
}