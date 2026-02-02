package com.telusko.spring_ai_rag_platform.service;

import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ResumeTextExtractor {

    private final Tika tika = new Tika();

    public String extractText(MultipartFile file) {
        // Basic checks so we fail early with a clear message
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Resume file is missing or empty.");
        }

        try {
            // Tika reads the file stream and extracts readable text
            String text = tika.parseToString(file.getInputStream());

            // Clean-up: remove extra whitespace (optional but helpful)
            text = text.replaceAll("\\s+", " ").trim();

            if (text.isBlank()) {
                throw new IllegalStateException("Could not extract text from the uploaded resume.");
            }

            return text;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to extract resume text. Upload a valid PDF/DOCX/TXT.", e);
        }
    }
}
