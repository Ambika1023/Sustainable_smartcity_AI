"""Export OpenAPI schema to openapi.json for Swagger/Postman imports."""
import json
from app.main import app

if __name__ == "__main__":
    schema = app.openapi()
    with open("openapi.json", "w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2)
    print("✅ OpenAPI schema exported to backend/openapi.json")

