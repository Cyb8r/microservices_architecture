FROM node:16
COPY package*json ./
RUN npm install
WORKDIR /posts/my-app
COPY . .
EXPOSE 4000
CMD [ "node", "index.js" ]