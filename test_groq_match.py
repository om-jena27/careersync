from app.services.gemini import match_resume_and_jd_with_gemini

resume_test_1 = """
Alex Smith
Senior Java Engineer
Skills: Java, Spring Boot, Microservices, Oracle DB, Kubernetes, Kafka, Maven, JUnit
Experience: 6 years building high-throughput banking microservices with Java and Spring.
"""

jd_test_1 = """
Job Title: Senior Java Developer
Requirements: Must have 5+ years Java, Spring Boot, Microservices, Kafka, Redis, Docker, CI/CD.
"""

report = match_resume_and_jd_with_gemini(resume_test_1, jd_test_1)
print("DYNAMIC MATCH REPORT RESULTS:")
print("Score:", report.get("match_score"))
print("Matched Skills:", report.get("matched_skills"))
print("Missing Skills:", report.get("missing_skills"))
print("Experience Fit:", report.get("experience_fit"))
