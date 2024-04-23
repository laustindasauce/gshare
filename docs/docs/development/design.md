---
sidebar_position: 2
title: Design Uncertainties
---

Below is a list of uncertainties for the technical design of the gallery solution in general.

## Static vs Dynamic Non-Admin Pages

:::note
**Currently the gallery pages are STATIC while all other pages are DYNAMIC.**
:::

### Argument for static **non-admin** pages

- Improved performance
- Would more easily allow the use of blurred placeholder images (while loading) instead of the shimmer effect.
- Unlikely to update galleries once they are live.
- Can easily redeploy client with server when necessary.

### Argument for dynamic **non-admin** pages

- Changes instantly recognized on the galleries; i.e. additional images, different expiration, new title, etc..
- **The expiration of galleries recognized immediately.** When static, a rebuild would be required to remove gallery due to expiration
- Much quicker build time for Docker image (static requires build each run)

## Client Email Requirement

:::note
**Currently NOT requiring the client to enter email prior to downloading**
:::

### Argument to require client email:

- Better statistics and data around who and what clients are downloading from galleries.
- Can allow client users to 'favorite' images and create lists of their favorites
  - I don't see this feature being used by clients

### Argument NOT to require client email:

- Simplified download process for client experience and logic
- Easier for the client with no need to enter any personal info
- Still can track download events just won't know who initiated
