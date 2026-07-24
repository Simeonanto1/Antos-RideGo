FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    npm install --omit=dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . .

EXPOSE 3000

CMD ["npm", "start"]