---
sidebar_position: 9
title: Image Resizing
---

The Go server has server resizing built-in. The client application takes advantage of this to render web-sized images on demand.

## How it works

When you make a request to the API endpoint `/v1/images/{imageID}/{width}/{quality}` the server will pull the original image and resize based on the options passed. So, if the request comes in for width 256 and quality 75, the server will resize the original image to 256px width and 75 quality.

:::note PNG
If you distribute .png images then the quality option is not relevant as quality is only available for JPEG images.
:::

### Under the hood

The resize functionality is done using the [github.com/nfnt/resize](https://pkg.go.dev/github.com/nfnt/resize) package for the resize actions.

The [interpolation kernel](https://pkg.go.dev/github.com/nfnt/resize@v0.0.0-20180221191011-83c6a9932646#Lanczos3) we use with the nft/resize package is [Lanczos3](https://en.wikipedia.org/wiki/Lanczos_resampling).

### Future possibilities

Add in the ability to resize and reformat to one of the modern image formats like [Avif](https://en.wikipedia.org/wiki/AVIF) or [WebP](https://en.wikipedia.org/wiki/WebP).
