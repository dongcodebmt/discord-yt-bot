FROM node:alpine AS build-env
WORKDIR /app
COPY . ./
RUN npm install
RUN npm run build

FROM node:alpine
WORKDIR /app
RUN apk add --no-cache ffmpeg
COPY --from=build-env /app/dist ./dist
COPY --from=build-env /app/*.json ./
ENV NODE_ENV=production
RUN npm install
ENTRYPOINT ["npm", "run", "start"]
