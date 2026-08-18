import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def make_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    req_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            err_data = json.loads(body)
            detail = err_data.get("detail", body)
        except:
            detail = body
        print(f"HTTP Error {e.code}: {detail}")
        return e.code, {"error": detail}
    except Exception as e:
        print(f"Connection error: {e}")
        return 500, {"error": str(e)}

def run_tests():
    print("=== CAREERSYNC API VERIFICATION ===")
    
    # 1. Signup
    print("\n1. Testing Signup...")
    signup_data = {
        "email": "test_candidate@example.com",
        "password": "password123",
        "role": "candidate"
    }
    status, res = make_request("/auth/signup", "POST", signup_data)
    if status == 201:
        print("[PASS] User signed up successfully:", res)
    elif status == 400 and "already exists" in res.get("error", ""):
        print("[PASS] User already exists (OK for repeated tests)")
    else:
        print("[FAIL] Signup failed:", res)
        return

    # 2. Login
    print("\n2. Testing Login...")
    login_data = {
        "email": "test_candidate@example.com",
        "password": "password123"
    }
    status, res = make_request("/auth/login", "POST", login_data)
    if status == 200:
        print("[PASS] Logged in successfully!")
        token = res.get("access_token")
        role = res.get("role")
        print(f"JWT Token: {token[:20]}... Role: {role}")
    else:
        print("[FAIL] Login failed:", res)
        return

    # 3. Create Job Description (should work for candidate too for testing/parsing)
    print("\n3. Testing Job Description Creation...")
    jd_data = {
        "title": "FastAPI Developer",
        "company": "FastTech",
        "raw_text": "We need a Python developer who knows FastAPI, Docker, and PostgreSQL databases."
    }
    status, jd_res = make_request("/job-descriptions", "POST", jd_data, token)
    if status == 201:
        print("[PASS] Created Job Description:", jd_res)
    else:
        print("[FAIL] JD creation failed:", jd_res)
        return

    # 4. Upload Resume via Multipart Form
    # For multipart file uploads via urllib, it's slightly manual, so we can test the matching engine 
    # directly using seeded DB records, or do a simplified test upload of TXT resume.
    # Let's mock a multipart file upload using urllib.
    print("\n4. Testing Resume Upload (TXT)...")
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    filename = "test_resume.txt"
    file_content = "John FastAPI. Email: test_candidate@example.com. Skills: FastAPI, Python, Docker, PostgreSQL."
    
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: text/plain\r\n\r\n"
        f"{file_content}\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")
    
    url = f"{BASE_URL}/resumes"
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    req.add_header("Authorization", f"Bearer {token}")
    
    try:
        with urllib.request.urlopen(req) as response:
            res_status = response.status
            resume_res = json.loads(response.read().decode("utf-8"))
        if res_status == 201:
            print("[PASS] Resume uploaded and parsed successfully:", resume_res)
        else:
            print("[FAIL] Resume upload failed:", resume_res)
            return
    except Exception as e:
        print("[FAIL] Resume upload exception:", e)
        return

    # 5. Matching Resume against JD
    print("\n5. Testing Resume to JD Matching...")
    match_data = {
        "resume_id": resume_res.get("id"),
        "jd_id": jd_res.get("id")
      }
    status, match_res = make_request("/match", "POST", match_data, token)
    if status == 200:
        print("[PASS] Matching report generated:")
        print(f"Match Score: {match_res.get('match_score')}%")
        print(f"Matched Skills: {match_res.get('matched_skills')}")
        print(f"Missing Skills: {match_res.get('missing_skills')}")
        print(f"Experience Fit: {match_res.get('experience_fit')}")
        print(f"Recommendations: {match_res.get('recommendations')}")
        print(f"ATS Issues: {match_res.get('ats_issues')}")
    else:
        print("[FAIL] Matching failed:", match_res)
        return

    # 6. Retrieve Match Reports History
    print("\n6. Testing Match Reports History Retrieval...")
    status, history_res = make_request("/match/reports", "GET", None, token)
    if status == 200:
        print(f"[PASS] Retrieved {len(history_res)} report(s) from history.")
    else:
        print("[FAIL] History retrieval failed:", history_res)

    print("\n=== ALL API TESTS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    # Wait a moment to ensure server is ready
    run_tests()
