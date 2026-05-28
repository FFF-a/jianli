#!/bin/bash
# ==========================================
# 猎职后端 - 部署到阿里云 ECS
# 用法: ./deploy-to-ecs.sh
# ==========================================

set -e

ECS_HOST="118.31.109.161"
ECS_USER="root"
ECS_PATH="/opt/liezhi"
IMAGE_NAME="liezhi-backend:1.0.0"
TAR_FILE="liezhi-backend.tar"

echo ">>> [1/5] 本地构建 Docker 镜像..."
docker build -t ${IMAGE_NAME} .

echo ">>> [2/5] 导出镜像为 tar 文件..."
docker save -o ${TAR_FILE} ${IMAGE_NAME}

echo ">>> [3/5] 上传文件到 ECS..."
ssh ${ECS_USER}@${ECS_HOST} "mkdir -p ${ECS_PATH}"
scp ${TAR_FILE} docker-compose.yml ${ECS_USER}@${ECS_HOST}:${ECS_PATH}/

echo ">>> [4/5] ECS 上加载镜像并启动服务..."
ssh ${ECS_USER}@${ECS_HOST} << 'REMOTE_SCRIPT'
cd /opt/liezhi

# 加载后端镜像
docker load -i liezhi-backend.tar

# 如果没有 .env 则创建
if [ ! -f .env ]; then
    echo 'MYSQL_ROOT_PASSWORD=LieZhi@2026!' > .env
    echo ">>> 已创建默认 .env，请修改密码后重新部署"
fi

# 拉取 MySQL 镜像并启动
docker compose up -d

# 清理
rm -f liezhi-backend.tar

echo ">>> 服务状态:"
docker compose ps
REMOTE_SCRIPT

echo ">>> [5/5] 清理本地 tar 文件..."
rm -f ${TAR_FILE}

echo ""
echo "==========================================="
echo "  部署完成！访问: http://${ECS_HOST}:8080"
echo "==========================================="
