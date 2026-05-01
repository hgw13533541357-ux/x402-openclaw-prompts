FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY server.js ./
EXPOSE 4021
CMD ["node", "server.js"]
