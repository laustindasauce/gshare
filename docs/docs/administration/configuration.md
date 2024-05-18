---
sidebar_position: 1
title: Configuration
---

There are many configuration options available for you within the environment variables. There are environment variables for both the Client and Server side with some slight overlap between the two.

:::tip Single Environment File
Notice the `NEXT_PUBLIC_*` variables that are duplicated on client & server requirements. This is intentional so that you can use a single environment file and not have the need to put the same values twice.
:::

## Environment Variables

:::info Required
There are 7 unique environment variables that are required for gshare to run.

- NEXT_PUBLIC_CLIENT_URL
- NEXT_PUBLIC_PHOTOGRAPHER_NAME
- NEXT_PUBLIC_PHOTOGRAPHER_EMAIL
- NEXT_PUBLIC_PHOTOGRAPHER_WEBSITE
- SERVER_PROTOCOL
- SERVER_HOST
- JWT_SECRET_KEY
  :::

### Client

| Variable Name                        | Default   | Required |
| ------------------------------------ | --------- | -------- |
| **NEXT_PUBLIC_CLIENT_URL**           |           | yes      |
| **NEXT_PUBLIC_PHOTOGRAPHER_NAME**    |           | yes      |
| **NEXT_PUBLIC_PHOTOGRAPHER_EMAIL**   |           | yes      |
| **NEXT_PUBLIC_PHOTOGRAPHER_WEBSITE** |           | yes      |
| NEXT_PUBLIC_PHOTOGRAPHER_FAVICON     |           | no       |
| NEXT_PUBLIC_PHOTOGRAPHER_LOGO_LIGHT  |           | no       |
| NEXT_PUBLIC_PHOTOGRAPHER_LOGO_DARK   |           | no       |
| NEXT_PUBLIC_HOMEPAGE_ENABLED         | `true`    | no       |
| NEXT_PUBLIC_GALLERY_THEME_PRIMARY    | `#2E8555` | no       |
| NEXT_PUBLIC_GALLERY_THEME_TEXT       | `#ffffff` | no       |
| NEXT_PUBLIC_POWERED_BY_ENABLED       | `true`    | no       |
| NEXT_PUBLIC_IMAGE_MIN_WIDTH          | `256`     | no       |
| NEXT_PUBLIC_ADMIN_IMAGE_QUALITY      | `40`      | no       |

### Server

:::warning Redis Cache
When using Redis for cache -- If you download the zip for a gallery that response will be cached until the gallery expires. So, if you must make a change to the galleries images, these changes won't be reflected in the zip file. With memory cache, you can simply restart your instance to refresh the cache.
:::

| Variable Name                       | Default                                          | Required |
| ----------------------------------- | ------------------------------------------------ | -------- |
| **NEXT_PUBLIC_CLIENT_URL**          |                                                  | yes      |
| **NEXT_PUBLIC_PHOTOGRAPHER_NAME**   |                                                  | yes      |
| **SERVER_PROTOCOL**                 |                                                  | yes      |
| **SERVER_HOST**                     |                                                  | yes      |
| **JWT_SECRET_KEY**                  |                                                  | yes      |
| JWT_SECRET_KEY_EXPIRE_MINUTES_COUNT | `0`                                              | no       |
| JWT_SECRET_KEY_EXPIRE_HOURS_COUNT   | `6`                                              | no       |
| JWT_SECRET_KEY_EXPIRE_DAYS_COUNT    | `0`                                              | no       |
| CLIENT_CONTAINER                    | `gshare-client`                                  | no       |
| ALLOWED_ORIGINS                     | `http://localhost:3000`, `http://localhost:8323` | no       |
| SERVER_READ_TIMEOUT                 | `60`                                             | no       |
| MAX_BODY_SIZE                       | `10`                                             | no       |
| LIMITER_ENABLED                     | `false`                                          | no       |
| LIMITER_REQUESTS                    | `100`                                            | no       |
| LIMITER_EXPIRATION                  | `5`                                              | no       |
| SWAGGER_URL                         | `localhost:8323`                                 | no       |
| SWAGGER_PROTOCOL                    | `http,https`                                     | no       |
| TZ                                  | `UTC`                                            | no       |
| TWO_FACTOR_AUTHENTICATION           | `false`                                          | no       |
| CACHE_ENABLED                       | `true`                                           | no       |
| CACHE_DRIVER                        | `memory`                                         | no       |
| REDIS_HOST                          | `localhost`                                      | no       |
| REDIS_HOST                          | `6379`                                           | no       |
| REDIS_USER                          |                                                  | no       |
| REDIS_PASSWORD                      |                                                  | no       |
| DB_DRIVER                           | `sqlite`                                         | no       |
| DB_PATH                             | `/data`                                          | no       |
| DB_HOST                             | `localhost`                                      | no       |
| DB_USER                             | `gallery`                                        | no       |
| DB_NAME                             | `gshare_db`                                      | no       |
| DB_PASSWORD                         | `insecure`                                       | no       |
| DB_PORT                             | `5432`                                           | no       |
| GORM_LOG_LEVEL                      | `warn`                                           | no       |
| LOG_LEVEL                           | `info`                                           | no       |
| IMAGES_DIRECTORY                    | `/app/images`                                    | no       |
| IMAGES_WEB_SIZE_WIDTH               | `1080`                                           | no       |
| SMTP_FROM                           |                                                  | no       |
| SMTP_USERNAME                       |                                                  | no       |
| SMTP_PASSWORD                       |                                                  | no       |
| SMTP_HOST                           | `smtp.gmail.com`                                 | no       |
| SMTP_PORT                           | `587`                                            | no       |
| SMTP_TLS                            | `true`                                           | no       |
