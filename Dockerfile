FROM oven/bun
WORKDIR /usr/src/app

COPY package.json .
RUN bun install
COPY . .

#env
ARG URL 
ENV DATABASE_URL=$URL

# run the app
EXPOSE 3000/tcp
RUN [ "bunx", "prisma", "db", "pull" ]
RUN [ "bunx", "prisma", "generate" ]
CMD [ "bun", "run", "src/index.ts" ]