FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache make gcc g++ python3
RUN npm install
RUN npm rebuild bcrypt --build-from-source
COPY . .
EXPOSE 8000
CMD ["npm", "start"]