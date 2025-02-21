# Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake \
    ffmpeg

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD npx prisma generate && npx prisma migrate deploy && node dist/index.js