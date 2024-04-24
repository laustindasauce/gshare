---
sidebar_position: 1
title: Architecture
---

The technical architecture design for gshare follows a classic client-server model, leveraging HTTP for communication between the client and server via RESTful APIs. Data persistence is ensured through the utilization of a dedicated database, providing a reliable and scalable solution for storing and managing data across the system.

## Client

There is only the single client for gshare currently which is a `web app`. The web app is designed to be responsive and dynamic so that it can have full functionality on mobile.

### Web App

The web app is written in [TypeScript](https://www.typescriptlang.org/) and uses the [Next.js](https://nextjs.org/) framework along with [Material UI](https://mui.com/material-ui/getting-started/) as a component library. Additionally, we are using [PNPM](https://pnpm.io/) as our package manager.

## Server

The server has multiple services broken up into individual containers.

- `gshare-server`: REST API and background runner (alerts, reminders, etc.)
- `postgres`: Persistent data storage
- `redis`: **Optional** cache manager for `gshare-server`

### gshare-server

The Immich Server is a [Go](https://go.dev/) project. It uses the [Fiber](https://gofiber.io/) framework, with [GORM](https://gorm.io/) for database management.

The server is using [Swagger Documentation 2.0](https://swagger.io/specification/v2/) auto-generated with the [github.com/swaggo/swag](https://github.com/swaggo/swag) package.

### Postgres

Postgres serves as the primary data repository within gshare, housing all information except for images, which are stored directly in the filesystem.

## Redis

Redis is an optional add-on to gshare to replace the in-memory cache solution that is default. Adding Redis would allow persistent cache for the API responses.
