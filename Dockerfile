FROM node:alpine AS environment
RUN apk add --no-cache ffmpeg

FROM environment AS build
WORKDIR /app
COPY . ./
RUN npm install
RUN npm run build

FROM environment AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/*.json ./
ENV NODE_ENV=production
RUN npm install
ENTRYPOINT ["npm", "run", "start"]
