FROM python:3.11-slim

WORKDIR /app

# Copy python dependencies file and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code files
COPY backend/app ./app

EXPOSE 8000

# Execute FastAPI uvicorn runner
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
