@echo off
docker run --rm --name wb-frontend --mount type=bind,src=%cd%,dst=/app/joiner/frontend -p 4500:4500 -t wb-joiner-frontend
pause

