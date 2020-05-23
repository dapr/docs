FROM node:12-alpine as builder
# Intermediate build image

ENV NODE_ENV=production

COPY package*.json ./

RUN apk add --no-cache python make g++
RUN npm ci


FROM node:12-alpine as app
# Final app image

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=builder node_modules ./node_modules

COPY ./dist .

USER node

CMD [ "node", "main.js" ]
