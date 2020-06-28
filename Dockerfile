FROM node:alpine
WORKDIR /data
COPY package.json .
RUN npm install
COPY src .
VOLUME /data/public/datasets /data/public/stimuli
EXPOSE 8181
CMD node main.js