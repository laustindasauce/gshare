---
sidebar_position: 1
title: Responsive Gallery
---

The most important feature of this application is the image gallery that your clients will see.

### Responsive

The gallery is built to be fully responsive, using the [Masonry image list](https://mui.com/material-ui/react-image-list/#masonry-image-list) component from [Material UI](https://mui.com/material-ui/). No matter the device that your client is using to view and download their images, they should have a pleasant experience.

### Performance

The gallery is configured with performance in mind. Utilizing [srcset and sizes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images) along with our server's built-in image resizing to deliver crisp and web performant images.

### Overlay

When browsing the gallery on the web, you will see a subtle overlay at the bottom of an image when hovered that displays a download icon allowing clients to download directly from the full gallery. There is also the ability to click any image and open it in the [lightbox](./lightbox.md) for a larger view and ability to scroll / download.

### Demo

Take a peak at what the gallery looks like on different devices & browser sizes.

![demo gallery](/video/gallery-demo.gif)
