FROM node:23.7.0

RUN mkdir -p /app/joiner/frontend

WORKDIR /app/joiner/frontend

COPY ./package*.json .

RUN ["npm", "install"]

COPY . .

EXPOSE 4500

CMD [ "npm", "run", "dev", "--", "--host"]