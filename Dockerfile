FROM node:12 as releaser
ENV NODE_ENV=prod
COPY . /repo
WORKDIR /repo

RUN npm install && npm run build

FROM caddy 

WORKDIR /web
COPY --from=releaser /repo/public/ ./
