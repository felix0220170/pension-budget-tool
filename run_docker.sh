#!/bin/bash

# 定义镜像名和容器名
IMAGE_NAME="pension-budget-tool"
CONTAINER_NAME="pension-budget-tool-container"

# 检查容器是否存在，若存在则停止并删除
if docker ps -a --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    echo "正在停止并删除已存在的容器 $CONTAINER_NAME..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# 检查镜像是否存在，若存在则删除
if docker images -q $IMAGE_NAME | grep -q .; then
    echo "正在删除已存在的镜像 $IMAGE_NAME..."
    docker rmi $IMAGE_NAME
fi

# 构建镜像
docker build -t $IMAGE_NAME .

# 运行容器
docker run -d -p 8448:80 --name $CONTAINER_NAME $IMAGE_NAME