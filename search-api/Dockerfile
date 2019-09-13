FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

EXPOSE 6200

COPY . .

RUN npm run tsc

CMD [ "node", "bin/server.js" ]
