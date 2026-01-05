FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x entrypoint.sh

RUN npx prisma generate

EXPOSE 3000

CMD ["./entrypoint.sh"]