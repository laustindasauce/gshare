---
sidebar_position: 3
title: Build From Source
---

:::warning Not recommended
Docker Compose is the recommended way to install and run gshare on your machine.
:::

You can build your own gshare Docker images from source, if you desire. Since this isn't the recommended way to run gshare, the documentation will not be as thorough and there won't be much in the way of troubleshooting.

## 1. Clone the repository

Next, you will need to clone the repository to your local machine.

```bash
git clone https://github.com/austinbspencer/gshare.git
```

## 2. Build the images

Within the gshare repository you just cloned, you can build the client and server Docker images for gshare.

```bash title="Build server image"
docker build -f server.Dockerfile -t gshare-server .
```

```bash title="Build client image"
docker build -f client.Dockerfile -t gshare-client .
```

## 3. Run gshare

Now, using the images we just built we can run them with Docker. At this point I would recommend following the [Docker Compose](./docker.md) instructions and just swapping the image to the ones you built locally. However, if you prefer to run with vanilla Docker you can do that with the commands below.

```bash title="Run server"
docker run -d -p 8080:8080 \
--env-file .env \
-v /var/run/docker.sock:/var/run/docker.sock \
-v ./gshare_images:/app/images \
--name gshare-server \
gshare-server
```

```bash title="Run client"
docker run -d -p 3000:3000 \
--env-file .env \
--name gshare-client \
gshare-client
```
