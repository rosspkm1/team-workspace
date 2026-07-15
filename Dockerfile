# syntax=docker/dockerfile:1

# ---- Build stage: compile the Vite/React/TS app into a static bundle ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies against the committed lockfile for a reproducible build.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and produce the production bundle in /app/dist.
COPY . .
RUN npm run build

# ---- Serve stage: nginx serving only the static dist/ output ----
FROM nginx:alpine AS serve

# SPA fallback config so BrowserRouter deep links resolve to index.html.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy only the built assets from the build stage; no source or node_modules.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
