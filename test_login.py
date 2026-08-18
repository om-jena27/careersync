import urllib.request
import json

base_url = "http://127.0.0.1:8000"

def try_login(email, password):
    try:
        req = urllib.request.Request(
            f"{base_url}/auth/login",
            data=json.dumps({"email": email, "password": password}).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode('utf-8'))
        print(f"[SUCCESS] Login for {email}: role={data.get('role')}")
        return data["access_token"]
    except Exception as e:
        print(f"[FAILED] Login for {email}: {e}")
        return None

print("Testing candidate login...")
token1 = try_login("candidate@example.com", "password123")

print("\nTesting recruiter login...")
token2 = try_login("recruiter@example.com", "password123")
