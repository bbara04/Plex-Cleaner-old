#backend
FROM python:3.8-alpine
WORKDIR /app
COPY ./backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ./backend/. .
ENV FLASK_APP=./app.py
ENV FLASK_ENV=development
EXPOSE 5000
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]