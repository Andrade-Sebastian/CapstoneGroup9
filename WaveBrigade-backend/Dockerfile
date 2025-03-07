from denoland/deno:2.1.7  

run mkdir -p /app/backend 

run chown -R deno:deno /app/backend

WORKDIR /app/backend

COPY . .


EXPOSE 3000

run mkdir -p /server/src/media/photo-lab

run mkdir -p /server/src/media/video-lab

run mkdir -p /server/src/media/gallery-lab

run mkdir -p /server/src/media/article-lab

run chmod -R 777 /server/src/media/photo-lab

run chmod -R 777 /server/src/media/video-lab

run chmod -R 777 /server/src/media/gallery-lab

run chmod -R 777 /server/src/media/article-lab

run ["deno", "install"]

cmd ["deno", "task", "dev-main"]

