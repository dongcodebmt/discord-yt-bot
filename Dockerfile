FROM node:alpine AS build-env
WORKDIR /app
COPY . ./
RUN npm install
RUN npm run build

FROM node:alpine
WORKDIR /app
COPY --from=build-env /app/dist ./dist
COPY --from=build-env /app/package.json ./package.json
COPY --from=build-env /app/package-lock.json ./package-lock.json
COPY --from=build-env /app/node_modules ./node_modules
ENV NODE_ENV production
ENTRYPOINT ["npm", "run", "start"]
