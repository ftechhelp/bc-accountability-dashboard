# syntax=docker/dockerfile:1

# The tracker data in data/*.json is bundled into the JS at build time, so rebuild the image
# (`docker compose up -d --build`) after updating it. `npm run build` also validates the data
# and fails the image build if an entry is malformed.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
# Pre-compress so nginx serves .gz files directly (gzip_static) instead of compressing per request.
RUN find dist -type f \( -name '*.js' -o -name '*.css' -o -name '*.html' -o -name '*.svg' \) \
      -exec gzip -k -9 {} +

FROM nginx:1-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
