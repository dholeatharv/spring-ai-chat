# Resume ↔ Job Matching with Recruiter-Ready Insights

A full-stack application that compares a candidate’s resume against a job description and returns
structured, explainable match insights such as skill alignment, gaps, and improvement recommendations.

## 🚀 Why this project?
Recruiters and hiring systems don’t want raw AI text.
They want **clear signals**:
- How well does the resume match the job?
- What skills match?
- What skills are missing?
- What should the candidate improve?

This project focuses on **usable, recruiter-facing insights**, not AI hype.

---

## 🧠 Key Features
- Resume ↔ Job Description comparison
- Match score with reasoning
- Matched & missing skill extraction
- Actionable recommendations
- REST APIs with Swagger documentation
- Clean UI designed for recruiter readability

---

## 🛠️ Tech Stack

### Backend
- Java 21
- Spring Boot
- Spring AI (OpenAI)
- REST APIs
- Swagger / OpenAPI

### Frontend
- React
- Vite
- Tailwind CSS

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|------|---------|-------------|
| POST | `/api/match` | Match resume text with job description |
| POST | `/api/upload-resume` | Upload resume file (PDF/DOCX) |
| GET  | `/api/health` | Health check |

---

## 📊 Sample Output
```json
{
  "matchScore": 80,
  "matchedSkills": ["Java", "Spring Boot", "SQL", "REST"],
  "missingSkills": ["Docker"],
  "recommendations": [
    "Gain experience with Docker",
    "Practice containerized microservices"
  ],
  "summary": "Strong backend skill alignment with a minor tooling gap."
}
