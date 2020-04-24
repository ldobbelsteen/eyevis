FROM node
WORKDIR /data
COPY package.json ./
RUN npm install
COPY /src ./
EXPOSE 8181
CMD node main.js
