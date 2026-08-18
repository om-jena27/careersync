import urllib.request
import json

base_url = "http://127.0.0.1:8000"

def test_dynamic_matching():
    # Login candidate
    req = urllib.request.Request(
        f"{base_url}/auth/login",
        data=json.dumps({"email": "candidate@example.com", "password": "password123"}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    token = json.loads(res.read().decode('utf-8'))["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # 1. Create a target Job Description
    jd_payload = {
        "title": "Senior React & Node Developer",
        "company": "WebTech Inc",
        "raw_text": "We need a Senior Full-Stack Engineer with React, Next.js, TypeScript, Node.js, Express, MongoDB, and Tailwind CSS."
    }
    req_jd = urllib.request.Request(f"{base_url}/job-descriptions", data=json.dumps(jd_payload).encode('utf-8'), headers=headers)
    jd_res = json.loads(urllib.request.urlopen(req_jd).read().decode('utf-8'))
    jd_id = jd_res["id"]

    # Resume 1: Perfect Match Candidate
    res1_data = "John Doe. Senior React & Node Developer. Experienced in React, Next.js, TypeScript, Node.js, Express, MongoDB, Tailwind CSS, REST API, Git."
    # Resume 2: Partial Match Candidate
    res2_data = "Alice Smith. Python Backend Developer. Experienced in Python, Django, FastAPI, PostgreSQL, SQL, Docker, Linux, Git."
    # Resume 3: Java Candidate
    res3_data = "Robert Brown. Java Enterprise Engineer. Experienced in Java, Spring Boot, Microservices, Oracle, Maven, JUnit, Jenkins."

    candidates = [("John Doe (Full Match)", res1_data), ("Alice Smith (Python Dev)", res2_data), ("Robert Brown (Java Dev)", res3_data)]

    print("=== TESTING DYNAMIC REAL ANALYSIS ENGINE ===")
    for name, text in candidates:
        # Create Resume
        r_payload = {"title": name, "company": "N/A", "raw_text": text}
        # Call match directly with dynamic text test via match endpoint
        # Upload resume
        boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
        body = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="file"; filename="{name.replace(" ", "_")}.txt"\r\n'
            f"Content-Type: text/plain\r\n\r\n"
            f"{text}\r\n"
            f"--{boundary}--\r\n"
        ).encode('utf-8')
        
        req_up = urllib.request.Request(
            f"{base_url}/resumes",
            data=body,
            headers={"Authorization": f"Bearer {token}", "Content-Type": f"multipart/form-data; boundary={boundary}"}
        )
        up_res = json.loads(urllib.request.urlopen(req_up).read().decode('utf-8'))
        r_id = up_res["id"]

        # Match against JD
        req_match = urllib.request.Request(
            f"{base_url}/match",
            data=json.dumps({"resume_id": r_id, "jd_id": jd_id}).encode('utf-8'),
            headers=headers
        )
        match_res = json.loads(urllib.request.urlopen(req_match).read().decode('utf-8'))

        print(f"\nCandidate: {name}")
        print(f" -> Match Score: {match_res['match_score']}%")
        print(f" -> Matched Skills: {match_res['matched_skills']}")
        print(f" -> Missing Skills: {match_res['missing_skills']}")

if __name__ == "__main__":
    test_dynamic_matching()
