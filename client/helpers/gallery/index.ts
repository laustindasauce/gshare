import { GalleryModel, Photo } from "@/lib/models";

export const isGalleryLive = (gallery: GalleryModel): boolean => {
  if (!gallery.live || !gallery.expiration) {
    // Handle cases where necessary fields are missing or null
    return false;
  }

  const currentDate = new Date();
  const isLive =
    currentDate >= new Date(gallery.live) &&
    currentDate <= new Date(gallery.expiration);

  return isLive;
};

// Retrieve a random featured image if there isn't one set
export const randomFeaturedImage = (photos: Photo[]) => {
  // Filter photos with width > height
  const filteredPhotos = photos.filter((photo) => photo.width > photo.height);

  // Default empty value
  let randomlyChosenPhoto: Photo = {
    ID: 0,
    height: 0,
    width: 0,
    CreatedAt: new Date(),
    UpdatedAt: new Date(),
    DeletedAt: null,
    gallery_id: 0,
    size: 0,
    position: 0,
    filename: "",
  };

  // Check if there are any photos with width > height
  if (filteredPhotos.length > 0) {
    // Randomly choose a photo from filteredPhotos
    const randomIndex = Math.floor(Math.random() * filteredPhotos.length);
    randomlyChosenPhoto = filteredPhotos[randomIndex];
  } else if (photos.length > 0) {
    // Randomly choose a photo from all photos
    const randomIndex = Math.floor(Math.random() * photos.length);
    randomlyChosenPhoto = photos[randomIndex];
  }

  return randomlyChosenPhoto;
};
