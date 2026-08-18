import urllib.request
import json

base_url = "http://127.0.0.1:8000"

def test_extra_features():
    # 1. Login candidate
    req = urllib.request.Request(
        f"{base_url}/auth/login",
        data=json.dumps({"email": "candidate@example.com", "password": "password123"}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    token = json.loads(res.read().decode('utf-8'))["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    print("1. Testing AI Bullet Optimizer Endpoint...")
    req_bullet = urllib.request.Request(
        f"{base_url}/match/optimize-bullet",
        data=json.dumps({"resume_id": 1, "jd_id": 1, "target_skill": "Docker"}).encode('utf-8'),
        headers=headers
    )
    res_bullet = urllib.request.urlopen(req_bullet)
    bullets = json.loads(res_bullet.read().decode('utf-8'))
    print("[PASS] Generated Bullets:", bullets)

    print("\n2. Testing AI Recruiter Interview Screening Questions Endpoint...")
    req_q = urllib.request.Request(
        f"{base_url}/match/interview-questions",
        data=json.dumps({"resume_id": 1, "jd_id": 1}).encode('utf-8'),
        headers=headers
    )
    res_q = urllib.request.urlopen(req_q)
    questions = json.loads(res_q.read().decode('utf-8'))
    print("[PASS] Generated Interview Questions:", questions)

if __name__ == "__main__":
    test_extra_features()
