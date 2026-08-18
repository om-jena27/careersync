from app.core.database import SessionLocal
from app.models.models import User
from app.core.security import verify_password, hash_password

db = SessionLocal()
users = db.query(User).all()
print("SEEDED USERS IN DATABASE:")
for u in users:
    print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}")
    print(" Verify 'password123':", verify_password("password123", u.password_hash))
