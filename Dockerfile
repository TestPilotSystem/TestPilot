FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["./entrypoint.sh"]