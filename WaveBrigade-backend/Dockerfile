from denoland/deno:2.1.7  

run mkdir -p /app/backend 

run chown -R deno:deno /app/backend

WORKDIR /app/backend

COPY . .


EXPOSE 3000

run ["deno", "install"]

cmd ["deno", "task", "dev-main"]

