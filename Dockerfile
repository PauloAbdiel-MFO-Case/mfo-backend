FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY ./prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run dev"]