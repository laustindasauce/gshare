---
sidebar_position: 12
title: FAQ
---

# FAQ

## How to reset admin password

If you've forgotten the admin user password, the only way to update it is through the database.

#### 1. Open the database with the cli

> SQLite

```bash
sqlite3 gshare.db
```

> PostgreSQL (assuming Docker)

```bash
docker exec -it postgres psql -U gshare -W gshare_db
```

#### 2. Set the password as `password` hashed

```bash
UPDATE users SET password = '$2a$08$nUOUl5aXuzA.U15ZUFpzHuBfnDmUqEFbJf0vO5GH4FdZJyR4WyQH6' WHERE email = 'your_email@domain.dev';
```

## How to access API docs

**You can access the documentation by going to `/api/swagger/index.html` on your server instance.**

The API documentation is built into your deployment as [Swagger](https://swagger.io/) docs. The Swagger documentation is built automatically with [gofiber/swagger](https://github.com/gofiber/swagger).
