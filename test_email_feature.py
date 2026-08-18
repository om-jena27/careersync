import urllib.request
import json

base_url = "http://127.0.0.1:8000"

def test_email_feature():
    # Login recruiter
    req = urllib.request.Request(
        f"{base_url}/auth/login",
        data=json.dumps({"email": "recruiter@example.com", "password": "password123"}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    token = json.loads(res.read().decode('utf-8'))["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    print("Testing Candidate Selection Email Dispatch...")
    payload_select = {
        "candidate_email": "john_doe@gmail.com",
        "candidate_name": "John Doe",
        "job_title": "Backend Developer",
        "status": "selected",
        "custom_note": "Great performance on FastAPI tests!"
    }
    req_sel = urllib.request.Request(f"{base_url}/match/send-candidate-email", data=json.dumps(payload_select).encode('utf-8'), headers=headers)
    res_sel = json.loads(urllib.request.urlopen(req_sel).read().decode('utf-8'))
    print("[PASS] Selection Email Result:", res_sel["message"])

    print("\nTesting Candidate Rejection Email Dispatch...")
    payload_reject = {
        "candidate_email": "jane_doe@gmail.com",
        "candidate_name": "Jane Doe",
        "job_title": "Backend Developer",
        "status": "rejected",
        "custom_note": "We required 5+ years experience."
    }
    req_rej = urllib.request.Request(f"{base_url}/match/send-candidate-email", data=json.dumps(payload_reject).encode('utf-8'), headers=headers)
    res_rej = json.loads(urllib.request.urlopen(req_rej).read().decode('utf-8'))
    print("[PASS] Rejection Email Result:", res_rej["message"])

if __name__ == "__main__":
    test_email_feature()
