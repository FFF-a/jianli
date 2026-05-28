#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "========================================"
echo " 猎职 LieZhi - 一键构建部署"
echo "========================================"
echo ""

echo "[1/3] 构建前端..."
pnpm vite build
echo "前端构建完成 (backend/src/main/resources/static)"
echo ""

echo "[2/3] 打包后端..."
cd backend
./mvnw package -DskipTests -q
echo "后端打包完成 (target/liezhi-backend-1.0.0.jar)"
echo ""

echo "[3/3] 启动服务..."
echo "访问 http://localhost:8080"
echo "按 Ctrl+C 停止"
echo ""
java -jar target/liezhi-backend-1.0.0.jar
