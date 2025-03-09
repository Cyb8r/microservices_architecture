FROM node:16
COPY package*json ./
RUN npm install
WORKDIR /app
COPY . .
EXPOSE 4005
CMD [ "node", "index.js" ]