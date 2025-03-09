FROM node:16
COPY package*json ./
WORKDIR /app
RUN npm install
COPY . .
EXPOSE 4001
CMD [ "node", "index.js" ]