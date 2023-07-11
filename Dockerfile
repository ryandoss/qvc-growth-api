
FROM node:18.14.0 As development


WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY prisma ./prisma/

RUN apt-get update \
    && apt-get install -y openssl libssl-dev \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


RUN npm ci


COPY . .


RUN npm run build


USER node

FROM node:18.14.0 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY --from=development /app/package*.json ./
COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/dist ./dist

USER node
EXPOSE 3000
# Start the server using the production build
CMD [ "npm", "run", "start:migrate:prod" ]
