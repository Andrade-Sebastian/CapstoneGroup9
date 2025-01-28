ARG EMOTIBIT_IP_ADDRESS
# docker build --build-arg MODEL_TO_COPY=model_name -t <container>:<model_name specific tag> .
FROM node:23.6.1

RUN mkdir -p /app/brainflow


RUN chown -R node:node /app/brainflow

WORKDIR /app/brainflow
RUN touch aux_from_streamer.csv

RUN touch anc_from_streamer.csv

COPY ./readEmotibitData.ts .

EXPOSE 3132-3134

COPY ./package.json .

RUN ["npm", "install"]
# Args: IP address of the EmotiBit device

RUN ["npx", "tsc", "readEmotibitData.ts"]

CMD ["node", "readEmotibitData.js", "${EMOTIBIT_IP_ADDRESS}"]




