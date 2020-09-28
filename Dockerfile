FROM node:alpine
WORKDIR /eyevis
COPY package*.json .
RUN npm install --production
COPY src .
VOLUME /eyevis/public/datasets /eyevis/public/stimuli
EXPOSE 8080
CMD ["node", "main.js"]
