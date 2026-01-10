FROM node:20-alpine

RUN npm install --global corepack@latest
RUN corepack enable pnpm

RUN mkdir -p /usr/share/neya-le-poti-robot
WORKDIR /usr/share/neya-le-poti-robot

COPY . /usr/share/neya-le-poti-robot
RUN rm -rf /usr/share/neya-le-poti-robot/node_modules
RUN rm -rf /usr/share/neya-le-poti-robot/dist

RUN pnpm install
RUN pnpm run build

ENV NODE_ENV=development

CMD ["node", "dist/src/autostart.js"]