# 1-bosqich: Bog'liqliklarni o'rnatish
FROM oven/bun:1.1 AS base
WORKDIR /app

# Package fayllarini ko'chiramiz
COPY package.json bun.lock* ./

# Kutubxonalarni o'rnatamiz
RUN bun install --frozen-lockfile

# 2-bosqich: Kodni ko'chirish va ishga tushirish
FROM oven/bun:1.1-slim AS release
WORKDIR /app

# Faqat kerakli node_modules va fayllarni olamiz
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Hono porti
EXPOSE 3000

# API-ni ishga tushirish
CMD ["bun", "run", "start"]