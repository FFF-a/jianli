# ============================================
# Stage 1: Build frontend (React + Vite)
# ============================================
FROM node:20-alpine AS frontend-build

RUN npm install -g pnpm@9

WORKDIR /app

# 安装前端依赖（利用 Docker 层缓存）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# 复制前端源码和构建配置
COPY index.html vite.config.ts tsconfig.json postcss.config.mjs ./
COPY default_shadcn_theme.css ./
COPY public/ ./public/
COPY src/ ./src/

# 构建前端 → dist/
RUN pnpm vite build

# ============================================
# Stage 2: Build backend (Spring Boot + Maven)
# ============================================
FROM maven:3.9-eclipse-temurin-17 AS backend-build

WORKDIR /app

# 先复制 pom.xml 用于缓存 Maven 依赖
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B -q || true

# 复制后端源码
COPY backend/src/ ./src/

# 将前端构建产物复制到 static 目录
COPY --from=frontend-build /app/backend/src/main/resources/static/ ./src/main/resources/static/

# 打包 Spring Boot JAR
RUN mvn package -DskipTests -B -q

# ============================================
# Stage 3: Runtime (JRE 17 slim)
# ============================================
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# 创建非 root 用户运行应用
RUN groupadd -r liezhi && useradd -r -g liezhi liezhi

# 复制 JAR
COPY --from=backend-build /app/target/liezhi-backend-1.0.0.jar ./app.jar

# 切换到非 root 用户
USER liezhi

EXPOSE 8080

# 启动命令，默认使用 prod 配置文件
ENTRYPOINT ["java", "-jar", "app.jar"]
CMD ["--spring.profiles.active=prod"]
