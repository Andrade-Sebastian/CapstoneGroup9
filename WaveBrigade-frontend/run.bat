@echo off
docker run --rm --name wb-frontend -v ./src:/app/joiner/frontend/src -p 4500:4500 -t wb-joiner-frontend
pause

