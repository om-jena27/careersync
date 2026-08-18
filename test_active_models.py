from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)
models = ["openai/gpt-oss-120b", "groq/compound", "groq/compound-mini", "qwen/qwen3.6-27b"]

for m in models:
    try:
        res = client.chat.completions.create(
            messages=[{"role": "user", "content": "Hi! Respond in JSON: {\"status\": \"working\"}"}],
            model=m
        )
        print(f"[SUCCESS] Model '{m}' works! Output: {res.choices[0].message.content}")
        break
    except Exception as e:
        print(f"[FAILED] Model '{m}': {e}")
