# Stage 1: Build Angular app
FROM node:18 AS build

WORKDIR /app/WEB
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# Stage 2: Serve with Nginx
FROM nginx:latest
COPY --from=build /app/WEB/dist/web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]