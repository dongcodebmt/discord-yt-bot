FROM node:alpine AS build-env
WORKDIR /app
COPY . ./
RUN npm install
RUN npm run build

FROM node:alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY --from=build-env /app/dist ./dist
COPY --from=build-env /app/cookies.json ./cookies.json
COPY --from=build-env /app/package.json ./package.json
COPY --from=build-env /app/package-lock.json ./package-lock.json
ENV NODE_ENV production
RUN npm install
ENTRYPOINT ["npm", "run", "start"]
