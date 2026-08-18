from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)
try:
    models = client.models.list()
    print("AVAILABLE GROQ MODELS:")
    for m in models.data:
        print(" -", m.id)
except Exception as e:
    print("Error listing models:", e)
