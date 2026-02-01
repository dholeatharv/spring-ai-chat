package com.telusko.spring_ai_rag_platform.controller;

import jakarta.validation.constraints.NotBlank;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai")
@Validated
public class AiController {

    private final ChatClient chatClient;

    public AiController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody @Validated ChatRequest request) {
        String reply = chatClient
                .prompt()
                .system("You are a helpful assistant. Answer clearly and concisely.")
                .user(request.message())
                .call()
                .content();

        return new ChatResponse(reply);
    }

    public record ChatRequest(@NotBlank String message) {}
    public record ChatResponse(String reply) {}
}

