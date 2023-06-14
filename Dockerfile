FROM node:latest

USER node

WORKDIR /home/node/app

COPY --chown=node:node . .

RUN npm install --silent
CMD ["npm", "run", "watch"]