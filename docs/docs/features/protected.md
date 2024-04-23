---
sidebar_position: 6
title: Protected Galleries
---

You can opt to have galleries password-protected at the gallery level. If you choose to have a gallery protected, the client will be required to enter the password before they can view the gallery.

## Protected Galleries

If you decide to password-protect your gallery, you would need to input the password. This allows you to be worry free that the intended clients for these images are the only ones with access. You may want this if you're worried about the privacy of your clients or if the images you are sharing are sensitive.

### Demo

When the gallery is protected and a client goes to the gallery, they will see the below page. Once the client inputs the correct password, they will gain full access to the gallery. If they leave the gallery and come back they will be forced to enter the password again.

![protected](https://i.imgur.com/pqL4XwB.png)

:::tip Query Password
You can avoid having your client see this screen when they access their gallery by including the password as a [url query parameter](https://www.branch.io/glossary/query-parameters/) with key `p`.

For example, if the protected gallery has a password of `super-secret` and you add `?p=super-secret` to the end of the link, then they will automatically be granted access.
:::
