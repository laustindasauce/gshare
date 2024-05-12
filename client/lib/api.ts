import axios from "axios";
import { getCookie } from "cookies-next";
import {
  ApiObject,
  Auth2FAModel,
  AuthModel,
  CompanyModel,
  CompanyResponse,
  EventModel,
  GalleriesResponse,
  GalleryResponse,
  GalleryUpdateModel,
  ImageDeleteResponse,
  LoginResponse,
  NewGalleryModel,
  SettingsResponse,
  UserUpdateModel,
} from "@/lib/models";
import { getImageBlurURL } from "@/helpers/photos";

const axiosApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/",
  withCredentials: true,
});

const createFirstUser = async (data: AuthModel) =>
  new Promise<LoginResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "post",
      url: `v1/users/admin/create`,
      data,
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const updateUser = async (data: UserUpdateModel, id: string | number) =>
  new Promise<LoginResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "put",
      url: `v1/users/${id}`,
      data,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const login = async (data: AuthModel) =>
  new Promise<LoginResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "post",
      url: `v1/auth`,
      data,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const login2FA = async (data: Auth2FAModel) =>
  new Promise<LoginResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "post",
      url: `v1/auth/2fa`,
      data,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const getAuthUser = async (token: string) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `/v1/auth`,
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const updateAuthAdmin = async (email: string) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "put",
      url: `v1/auth`,
      data: { email },
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const getGallery = async (path: string) =>
  new Promise<GalleryResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/galleries/path/${path}`,
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const unlockGallery = async (path: string, password: string) =>
  new Promise<GalleryResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "post",
      url: `v1/galleries/path/${path}`,
      data: { password },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const getPublicGalleries = async () =>
  new Promise<GalleriesResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/galleries/public`,
    })
      .then(async (res) => {
        let galleries = res.data as GalleriesResponse;

        if (galleries.data.length === 0) {
          resolve(galleries);
          return;
        }

        // Iterate through galleries
        for (const gallery of galleries.data) {
          try {
            const response = await axios.get(
              getImageBlurURL(gallery.featured_image.ID, 64, 30),
              {
                responseType: "arraybuffer", // Ensure response is treated as binary data
              }
            );

            if (!response || !response.data) {
              throw new Error("Empty or invalid image data received");
            }

            // Convert the binary image data to base64
            const base64Image = Buffer.from(response.data, "binary").toString(
              "base64"
            );

            // Set base64 string as placeholder
            gallery.featured_image = {
              ...gallery.featured_image,
              blurDataURL: `data:image/jpeg;base64,${base64Image}`,
            };

            if (gallery === galleries.data[galleries.data.length - 1]) {
              resolve(galleries);
            }
          } catch (error) {
            console.error("Error fetching image:", error);
            reject(error);
          }
        }
      })
      .catch((err) => reject(err.response?.data || err))
  );

const getLiveGalleries = async () =>
  new Promise<GalleriesResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/galleries/live`,
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const createGallery = async (data: NewGalleryModel) =>
  new Promise<GalleryResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "post",
      url: `v1/galleries`,
      data,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const getGalleries = async (token: string) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/galleries`,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const getGalleryById = async (id: string | number) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/galleries/id/${id}`,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const getGalleryByIdServerSide = async (id: string | number, token: string) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/galleries/id/${id}`,
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const updateGallery = async (data: GalleryUpdateModel, id: number) =>
  new Promise<GalleryResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "put",
      url: `v1/galleries/id/${id}`,
      data,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const deleteGallery = async (id: number) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "delete",
      url: `v1/galleries/id/${id}`,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const uploadGalleryImage = async (uploadData: any, id: number | string) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "post",
      url: `v1/galleries/id/${id}/images`,
      data: uploadData,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
        "Content-Type": "multipart/form-data",
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const createGalleryImageZips = async (id: number) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "post",
      url: `v1/galleries/id/${id}/images/zip`,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const getImages = async () =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/images`,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const getImage = async (id: number | string) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/images/${id}`,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const deleteImage = async (id: number) =>
  new Promise<ImageDeleteResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "delete",
      url: `v1/images/${id}`,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const downloadImage = async (size: string, imageId: number) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/download/${size}/image/${imageId}`,
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const downloadImages = async (size: string, imageIds: number[]) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/download/${size}/image/${imageIds.join(",")}`,
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const downloadGallery = async (size: string, galleryId: number) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/download/${size}/gallery/${galleryId}`,
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const createEvent = async (data: EventModel) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "post",
      url: `v1/events`,
      data,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const getEvent = async (id: number | string) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/events/${id}`,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const getEvents = async () =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/events`,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const deleteEvent = async (id: number) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "delete",
      url: `v1/events/${id}`,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const updateGalleryImagesOrder = async (
  id: number | string,
  imageIds: number[]
) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "put",
      url: `v1/galleries/id/${id}/images`,
      data: imageIds,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const createCompany = async (data: CompanyModel) =>
  new Promise<CompanyResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "post",
      url: `v1/company`,
      data,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const getCompany = async (id: number | string) =>
  new Promise<CompanyResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/company/${id}`,
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const updateCompany = async (data: CompanyModel) =>
  new Promise<CompanyResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "put",
      url: `v1/company/${data.ID}`,
      data,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const deleteCompany = async (id: number) =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "delete",
      url: `v1/company/${id}`,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const getSettings = async (_: any) =>
  new Promise<SettingsResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/settings`,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const getSettingsPublic = async () =>
  new Promise<SettingsResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "get",
      url: `v1/settings/public`,
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const updateSettings = async () =>
  new Promise<GalleryResponse>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "put",
      url: `v1/settings`,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const redeploySite = async () =>
  new Promise<any>((resolve, reject) =>
    axiosApi(<ApiObject>{
      method: "post",
      url: `v1/settings/redeploy`,
      headers: {
        Authorization: "Bearer " + getCookie("admin-token"),
      },
    })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response?.data || err))
  );

const api = {
  createCompany,
  createEvent,
  createFirstUser,
  createGallery,
  createGalleryImageZips,
  deleteCompany,
  deleteEvent,
  deleteGallery,
  deleteImage,
  downloadGallery,
  downloadImage,
  downloadImages,
  getAuthUser,
  getCompany,
  getEvent,
  getEvents,
  getGalleries,
  getGallery,
  getGalleryById,
  getGalleryByIdServerSide,
  getImage,
  getImages,
  getLiveGalleries,
  getPublicGalleries,
  getSettings,
  getSettingsPublic,
  login,
  login2FA,
  redeploySite,
  unlockGallery,
  updateAuthAdmin,
  updateCompany,
  updateGallery,
  updateGalleryImagesOrder,
  updateSettings,
  updateUser,
  uploadGalleryImage,
};

export default api;
