package com.telusko.spring_ai_rag_platform.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
public class ResumeParserService {

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file uploaded");
        }

        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();

        // We support by contentType OR by extension (because some browsers send weird types)
        boolean isPdf = "application/pdf".equals(contentType) || fileName.endsWith(".pdf");
        boolean isDocx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(contentType)
                || fileName.endsWith(".docx");

        if (!isPdf && !isDocx) {
            throw new IllegalArgumentException("Only PDF or DOCX files are supported");
        }

        try (InputStream in = file.getInputStream()) {
            if (isPdf) return extractPdf(in);
            return extractDocx(in);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse resume file", e);
        }
    }

    private String extractPdf(InputStream in) throws Exception {
        try (PDDocument document = PDDocument.load(in)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document).trim();
        }
    }

    private String extractDocx(InputStream in) throws Exception {
        try (XWPFDocument doc = new XWPFDocument(in);
             XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            return extractor.getText().trim();
        }
    }
}
