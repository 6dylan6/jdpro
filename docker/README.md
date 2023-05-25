# Usage

> 推荐使用`docker-compose`所以这里只介绍`docker-compose`使用方式



## Docker安装

 

- 国内一键安装 `sudo curl -sSL https://get.daocloud.io/docker | sh`
- 国外一键安装 `sudo curl -sSL get.docker.com | sh`
- 北京外国语大学开源软件镜像站 `https://mirrors.bfsu.edu.cn/help/docker-ce/`


docker-compose 安装（群晖`nas docker`自带安装了`docker-compose`）

```
curl -L https://get.daocloud.io/docker/compose/releases/download/v2.1.0/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```
`Ubuntu`用户快速安装`docker-compose`
```
sudo apt-get update && sudo apt-get install -y python3-pip curl vim git moreutils
pip3 install --upgrade pip
pip install docker-compose
```

## win10用户安装[docker desktop](https://www.docker.com/products/docker-desktop)

通过`docker-compose version`查看`docker-compose`版本，确认是否安装成功。



## 常用命令

 `docker-compose up -d` 启动（修改docker-compose.yml后需要使用此命令使更改生效）；  
 `docker-compose logs` 打印日志；  
 `docker-compose logs -f` 打印日志，-f表示跟随日志；  
 `docker logs -f qinglong` 和上面两条相比可以显示汉字；  
 `docker-compose pull` 更新镜像；  
 `docker-compose stop` 停止容器；  
 `docker-compose restart` 重启容器；  
 `docker-compose down` 停止并删除容器；  

## 青龙一键部署（2.11.3版本）

1. 新建一个文件夹，用于存放相关数据
2. 下载本仓库中的`docker-compose.yml`至本地，或是复制文件内容后在本地自行建立并粘贴内容
3. 使用docker-compose启动
4. 浏览器输入ip:5700即可进入面板

###新建数据文件夹

```bash
mkdir qinglong
cd qinglong
```

###下载或复制docker-compose.yml文件

```bash
wget https://ghproxy.com/https://raw.githubusercontent.com/whyour/qinglong/develop/docker-compose.yml
```

###启动

```bash
docker-compose up -d
```
