package com.telusko.spring_ai_rag_platform.controller;

import com.telusko.spring_ai_rag_platform.dto.FileMatchResponse;
import com.telusko.spring_ai_rag_platform.dto.MatchRequest;
import com.telusko.spring_ai_rag_platform.dto.MatchResponse;
import com.telusko.spring_ai_rag_platform.dto.ResumeUploadResponse;
import com.telusko.spring_ai_rag_platform.service.JobMatchService;
import com.telusko.spring_ai_rag_platform.service.ResumeParserService;
import com.telusko.spring_ai_rag_platform.service.ResumeTextExtractor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class JobMatchController {

    private final JobMatchService jobMatchService;
    private final ResumeParserService resumeParserService;
    private final ResumeTextExtractor resumeTextExtractor;

    public JobMatchController(JobMatchService jobMatchService, ResumeParserService resumeParserService, ResumeTextExtractor resumeTextExtractor) {
        this.jobMatchService = jobMatchService;
        this.resumeParserService = resumeParserService;
        this.resumeTextExtractor = resumeTextExtractor;
    }

    @PostMapping("/match")
    public MatchResponse match(@Valid @RequestBody MatchRequest request) {
        return jobMatchService.match(request);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

    @PostMapping("/upload-resume")
    public ResumeUploadResponse uploadResume(@RequestParam("file") MultipartFile file) {
        String text = resumeParserService.extractText(file);

        return new ResumeUploadResponse(
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                text
        );
    }

    @PostMapping("/match/file")
    public FileMatchResponse matchFromFiles(
            @RequestParam("resume") MultipartFile resume,
            @RequestParam("job") MultipartFile job
    ) {

        String resumeText = resumeTextExtractor.extractText(resume);
        String jobText = resumeTextExtractor.extractText(job);

        MatchRequest request = new MatchRequest(resumeText, jobText);
        MatchResponse match = jobMatchService.match(request);

        return new FileMatchResponse(
                match,
                resume.getOriginalFilename(),
                job.getOriginalFilename()
        );
    }
}
