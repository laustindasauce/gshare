---
sidebar_position: 2
title: Docker Compose (Recommended)
---

Docker Compose is the recommended method to deploy gshare.

:::info Prerequisites
Be sure to check [requirements](./requirements.md) before following this guide.
:::

## 1. Set up directory

First, it's recommended but not required to create a `gshare` directory where your installation configs will be stored.

```bash
mkdir gshare
```

After creating the `gshare` directory, we'll make it our working directory.

```bash
cd gshare
```

## 2. Download necessary files

Download the example Docker Compose and environment files from the [gshare GitHub repository](https://github.com/austinbspencer/gshare).

```bash
wget https://raw.githubusercontent.com/austinbspencer/gshare/main/docker-compose.yml.example docker-compose.yml
```

```bash
wget https://github.com/austinbspencer/gshare/raw/main/gshare.env.example gshare.env
```

## 3. Update the environment file

**Please note that there are some required updates you must make to your environment file!**

:::note Environment
It is **highly** recommended that you read through the [configuration](../administration/configuration.md) docs for a full understanding of the environment.
:::

## 4. Update the Docker Compose file (Optional)

Once we have the example Docker Compose file, use your preferred text editor to change any settings you'd like.

- Change the ports
- Move the volume location for the images directory

:::warning Environment
Some environment variables will have an impact on the Docker Compose file if you change them.

Example: If you alter the port for the client and/or server then you must make the same change to the Docker Compose file.
:::

## 5. Start the Docker containers

From the `gshare` directory, or whichever directory you created in [step 1](#1-set-up-directory), run the following command.

```bash
docker compose up -d
```

## 6. Updating

It is highly recommended that you do not use Watchtower or any other tool to automate your upgrades for gshare. This is due to the fact that gshare is currently [unstable](https://semver.org/#spec-item-4), meaning there could be changes at any time.
