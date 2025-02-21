FROM node:20-alpine

WORKDIR /app

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
    automake

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev"]