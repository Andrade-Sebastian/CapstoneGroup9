FROM python:3.12.8

RUN mkdir -p /app/grpc

WORKDIR /app/grpc

COPY . .

RUN ["pip", "install", "-r", "requirements.txt"]

EXPOSE 50051

CMD ["python", "emotiBits_server.py"]