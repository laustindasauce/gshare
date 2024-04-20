# gshare

gshare is a self-hosted photo sharing website designed to provide a seamless experience for sharing photos with clients without the need for a paid service. With gshare, you can easily manage and share your photos in a secure and customizable environment.

## Features

- **Self-Hosted:** Host gshare on your own server, giving you full control over your data and privacy.
- **Photography Centered:** Peace of mind knowing your original images are **ALWAYS** preserved with _no limit_ on the size of the original image.
- **Client-Focused Sharing:** Easily share photos with clients, providing them with a professional and personalized experience.
- **Customizable:** Customize gshare to match your branding, creating a cohesive look for your photo sharing platform.
- **User-Friendly Interface:** Intuitive interface makes it easy to upload, organize, and share photos with clients, ensuring a smooth workflow.
- **Secure:** Optional Two Factor Authentication for admin login.

## Getting Started

To get started with gshare, follow these steps:

1. **Deploy:** Deploy the public gshare container OR build and deploy locally from source code.
2. **Configuration:** Customize gshare by configuring environment variables such as branding, security options, and more.
3. **Upload Photos:** Upload your photos to gshare and organize them into albums or categories as needed.
4. **Share with Clients:** Share the gshare link with your clients and provide them with password if necessary.
5. **Manage Content:** Easily mange your galleries and client access through the gshare admin panel.

## Environment Variables

### Client

| Variable Name                       | Default   | Required |
| ----------------------------------- | --------- | -------- |
| NEXT_PUBLIC_API_URL                 |           | yes      |
| NEXT_PUBLIC_CLIENT_URL              |           | yes      |
| NEXT_PUBLIC_PHOTOGRAPHER_NAME       |           | yes      |
| NEXT_PUBLIC_PHOTOGRAPHER_EMAIL      |           | yes      |
| NEXT_PUBLIC_PHOTOGRAPHER_WEBSITE    |           | yes      |
| NEXT_PUBLIC_GALLERY_THEME_PRIMARY   | `#2E8555` | no       |
| NEXT_PUBLIC_GALLERY_THEME_TEXT      | `#ffffff` | no       |
| NEXT_PUBLIC_GALLERY_HERO_ENABLED    | `true`    | no       |
| NEXT_PUBLIC_POWERED_BY_ENABLED      | `true`    | no       |
| NEXT_PUBLIC_PHOTOGRAPHER_FAVICON    |           | no       |
| NEXT_PUBLIC_PHOTOGRAPHER_LOGO_LIGHT |           | no       |
| NEXT_PUBLIC_PHOTOGRAPHER_LOGO_DARK  |           | no       |
| NEXT_PUBLIC_IMAGE_MIN_WIDTH         | `256`     | no       |
|                                     |           |          |
| HOMEPAGE_ENABLED                    | `true`    | no       |

### Server

> When using Redis for cache -- If you download the zip for a gallery that response will be cached until the gallery expires. So, if you must make a change to the galleries images, these changes won't be reflected in the zip file. With memory cache, you can simply restart your instance to refresh the cache.

> Notice the `NEXT_PUBLIC_*` variables that are duplicated here in the server. This is intentional so that you can use a single environment file and not have the need to put the same values twice.

| Variable Name                       | Default                                          | Required |
| ----------------------------------- | ------------------------------------------------ | -------- |
| NEXT_PUBLIC_CLIENT_URL              |                                                  | yes      |
| NEXT_PUBLIC_PHOTOGRAPHER_NAME       |                                                  | yes      |
| CLIENT_CONTAINER                    | `gshare-client`                                  | no       |
| ALLOWED_ORIGINS                     | `http://localhost:3000`, `http://localhost:8080` | no       |
| SERVER_READ_TIMEOUT                 | `60`                                             | no       |
| MAX_BODY_SIZE                       | `10`                                             | no       |
| LIMITER_ENABLED                     | `false`                                          | no       |
| LIMITER_REQUESTS                    | `100`                                            | no       |
| LIMITER_EXPIRATION                  | `5`                                              | no       |
| SWAGGER_URL                         | `localhost:8080`                                 | no       |
| SWAGGER_PROTOCOL                    | `http,https`                                     | no       |
| TZ                                  | `UTC`                                            | no       |
| JWT_SECRET_KEY                      |                                                  | yes      |
| JWT_SECRET_KEY_EXPIRE_MINUTES_COUNT | `0`                                              | no       |
| JWT_SECRET_KEY_EXPIRE_HOURS_COUNT   | `6`                                              | no       |
| JWT_SECRET_KEY_EXPIRE_DAYS_COUNT    | `0`                                              | no       |
| TWO_FACTOR_AUTHENTICATION           | `false`                                          | no       |
| CACHE_DRIVER                        | `memory`                                         | no       |
| REDIS_HOST                          | `localhost`                                      | no       |
| REDIS_HOST                          | `6379`                                           | no       |
| REDIS_USER                          |                                                  | no       |
| REDIS_PASSWORD                      |                                                  | no       |
| ADMIN_EMAIL                         | `admin@domain.dev`                               | no       |
| ADMIN_PASSWORD                      | `insecure`                                       | no       |
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

## Design Uncertainties

Below is a list of uncertainties for the technical design of the gallery solution in general.

1. Static vs Dynamic Non-Admin Pages
   > **Currently the gallery pages are STATIC while all other pages are DYNAMIC.**
   - Argument for static **non-admin** pages
     - Improved performance
     - Would allow the use of blurred placeholder images (while loading) instead of the shimmer effect.
     - Likely won't need to update galleries once they are live...
   - Argument for dynamic **non-admin** pages
     - Changes instantly recognized on the galleries; i.e. additional images, different expiration, new title, etc..
     - **The expiration of galleries recognized immediately.** When static, a rebuild would be required to remove gallery due to expiration
     - Much quicker build time for Docker image (static requires build each run)
2. Client Email Requirement
   > **Currently NOT requiring the client to enter email prior to downloading**
   - Argument for this:
     - Better statistics and data around who and what clients are downloading from galleries.
     - Can allow client users to 'favorite' images and create lists of their favorites
       - I don't see this feature being used by clients
   - Argument against:
     - Simplified download process for client experience and logic
     - Easier for the client with no need to enter any personal info
     - Still can track download events just won't know who initiated

## Contributing

We welcome contributions from the community to improve and enhance gshare. If you'd like to contribute, please follow these guidelines:

- Fork the repository and create a new branch for your feature or bug fix.
- Make sure your changes are test thoroughly.
- Submit a pull request with a clear description of your changes and their purpose.

## Development

TODO:: Add development details

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE), which means you are free to use, modify, and distribute the code as long as you include the original copyright notice and disclaimer. Any derivative works must also be licensed under the GPL v3.0.

## Support

If you encounter any issues or have any questions about gshare, please [open an issue](https://github.com/austinbspencer/gshare/issues) on GitHub. We'll do our best to assist you and address any concerns promptly.

---
