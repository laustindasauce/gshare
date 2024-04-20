import useSWR from "swr";
import { deleteCookie } from "cookies-next";
import {
  AuthResponse,
  GalleriesResponse,
  GalleryResponse,
  SettingsResponse,
} from "@/lib/models";
import api from "./api";
import Router from "next/router";

export const useAuthUser = (token: string) => {
  const { data, error } = useSWR<AuthResponse>(token, api.getAuthUser, {
    revalidateOnMount: true,
    revalidateOnFocus: true,
    // Don't send requests with the same key within 5 seconds apart
    dedupingInterval: 1000 * 5,
    // Refresh every 2 minutes in milliseconds
    refreshInterval: 1000 * 60 * 2,
  });

  // Remove the cookie on error
  if (!!error) {
    deleteCookie("admin-token");
    Router.push("/admin/login");
  }

  return {
    user: data,
    isLoading: !error && !data,
    isError: error,
  };
};

export const useGalleries = (params: any) => {
  const {
    data,
    error,
    mutate: mutateGalleries,
  } = useSWR<GalleriesResponse>(params, api.getGalleries, {
    revalidateOnMount: true,
    revalidateOnFocus: true,
    // Don't send requests with the same key within 15 seconds apart
    dedupingInterval: 1000 * 15,
    // Refresh every 5 minutes in milliseconds
    refreshInterval: 1000 * 60 * 5,
  });

  return {
    galleries: data?.data,
    isLoading: !error && !data,
    isError: error,
    mutateGalleries,
  };
};

export const useGallery = (params: any) => {
  const {
    data,
    error,
    mutate: mutateGallery,
  } = useSWR<GalleryResponse>(params, api.getGalleryById, {
    revalidateOnMount: true,
    revalidateOnFocus: true,
    // Don't send requests with the same key within 10 seconds apart
    dedupingInterval: 1000 * 10,
    // Refresh every 5 minutes in milliseconds
    refreshInterval: 1000 * 60 * 5,
  });

  if (!!error) {
    console.error(error);
  }

  return {
    gallery: data?.data,
    isLoading: !error && !data,
    isError: error,
    mutateGallery,
  };
};

export const usePublicGalleries = (params: any) => {
  const { data, error } = useSWR<GalleriesResponse>(
    params,
    api.getPublicGalleries,
    {
      revalidateOnMount: true,
      revalidateOnFocus: true,
      // Don't send requests with the same key within 15 seconds apart
      dedupingInterval: 1000 * 15,
      // Refresh every 5 minutes in milliseconds
      refreshInterval: 1000 * 60 * 5,
    }
  );

  return {
    galleries: data?.data,
    isLoading: !error && !data,
    isError: error,
  };
};

export const useLiveGallery = (params: any) => {
  const { data, error } = useSWR<GalleryResponse>(params, api.getGallery, {
    revalidateOnMount: true,
    revalidateOnFocus: true,
    // Don't send requests with the same key within 10 seconds apart
    dedupingInterval: 1000 * 10,
    // Refresh every 5 minutes in milliseconds
    refreshInterval: 1000 * 60 * 5,
  });

  if (!!error) {
    console.error(error);
  }

  return {
    gallery: data?.data,
    isLoading: !error && !data,
    isError: error,
  };
};

export const useApiStatus = (params: any) => {
  const { data, error } = useSWR<SettingsResponse>(params, api.getSettings, {
    revalidateOnMount: true,
    revalidateOnFocus: true,
    // Don't send requests with the same key within 10 seconds apart
    dedupingInterval: 1000 * 10,
    // Refresh every 5 minutes in milliseconds
    refreshInterval: 1000 * 60 * 5,
  });

  if (!!error) {
    console.error(error);
  }

  return {
    status: data?.data,
    isLoading: !error && !data,
    isError: error,
  };
};
