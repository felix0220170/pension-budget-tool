#!/bin/bash

# 构建 Docker 镜像
docker build -t pension-budget-tool .

# 运行 Docker 容器，并将容器的 80 端口映射到宿主机的 8448 端口
docker run -d -p 8448:80 --name pension-budget-tool-container pension-budget-tool