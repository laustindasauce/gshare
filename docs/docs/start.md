---
sidebar_position: 2
title: Quick Start
---

Below is the quickest way to get started and try out gshare.

## Run with Docker Compose

Carefully follow the [Docker Compose (Recommended)](./deploy/docker.md) installation guide.

## Open the Web App

You can access the web app admin pages by going to `http://machine-ip:3000/admin`.

Once you have accessed the admin page, you should be able to create your admin account.

:::info Admin Creation
This will only be available while there isn't a user created. Once the admin user has been created you will no longer have the ability to create a new account.
:::

![create admin](https://i.imgur.com/AZHPxoI.png)

## Test gshare functionality

### Create a gallery

Try to [create a new gallery](./administration/gallery.md#create-a-new-gallery) in the web app.

### Upload images to gallery

Once you have a gallery created you can [upload images](./administration/gallery.md#upload-images) for the gallery!

## Next Steps

- Refine your configuration and environment variables and redeploy for production.
- Deploy a live gallery which is visible to the public!
- Experiment with the Redis cache option.
- Consider your preferred database (SQLite or PostreSQL)
