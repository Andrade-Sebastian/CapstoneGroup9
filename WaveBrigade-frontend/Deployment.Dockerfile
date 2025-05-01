FROM node:23.7.0 AS builder_stage
RUN mkdir -p /app/joiner/frontend
WORKDIR /app/joiner/frontend

ENV BACKEND_PATH=https://rsjwavebrigade.com/backend
ENV BACKEND_SOCKET=https://rsjwavebrigade.com

COPY ./package*.json .
RUN ["npm", "install"]
COPY . .

RUN ["npm", "run", "build"]

FROM node:23.7.0 AS deploy_stage
RUN mkdir -p /app/joiner/frontend
WORKDIR /app/joiner/frontend

COPY --from=builder_stage ./app/joiner/frontend/dist ./dist

RUN ["npm", "install", "-g", "serve"]
EXPOSE 4500
CMD [ "serve", "./dist", "-l", "4500"]