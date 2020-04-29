FROM node
WORKDIR /data
COPY package.json ./
RUN npm install
COPY /src ./
CMD node main.js