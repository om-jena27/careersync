from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)
models_to_test = ["llama-3.1-8b-instant", "llama3-70b-8192", "gemma2-9b-it", "mixtral-8x7b-32768", "llama-3.3-70b-specdec"]

for m in models_to_test:
    try:
        res = client.chat.completions.create(
            messages=[{"role": "user", "content": "Hi, respond with JSON: {\"status\": \"ok\"}"}],
            model=m,
            response_format={"type": "json_object"}
        )
        print(f"[SUCCESS] Model '{m}' works! Output: {res.choices[0].message.content}")
        break
    except Exception as e:
        print(f"[FAILED] Model '{m}': {e}")
