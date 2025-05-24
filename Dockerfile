# 第一阶段：构建 React 项目
FROM node:latest as builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 构建 React 项目
RUN npm run build

# 第二阶段：使用 Nginx 部署构建好的项目
FROM nginx:latest

# 删除默认的 Nginx 配置文件
RUN rm /etc/nginx/conf.d/default.conf

# 将项目中的配置文件复制到 Nginx 配置目录
COPY nginx.conf /etc/nginx/nginx.conf

# 从第一阶段复制构建好的文件到 Nginx 默认的静态文件目录
COPY --from=builder /app/build /usr/share/nginx/html

# 使用CMD启动Nginx，并让其在前台运行
CMD ["nginx", "-g", "daemon off;"]