FROM node:12 as releaser

COPY . /repo
WORKDIR /repo

RUN npm install && npm run build

FROM caddy 

WORKDIR /web
COPY --from=releaser /repo/public ./

CMD ["caddy", "file-server", "-root=/web"]
