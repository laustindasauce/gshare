import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import dayjs from "dayjs";

export interface Photo {
  ID: number;
  CreatedAt: Date;
  UpdatedAt: Date;
  DeletedAt: Date | null;
  gallery_id: number;
  featured_gallery_id?: number | null;
  size: number;
  height: number;
  width: number;
  position: number;
  filename: string;
  blurDataURL?: string;
}

export interface SortablePhotoModel {
  src: string;
  width: number;
  height: number;
  alt: string;
  key: string;
  blurDataURL?: string;
  download?: string;
  id: number;
}

export interface LightboxPhoto {
  ID?: number;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  DeletedAt?: Date | null;
  gallery_id?: number;
  featured_gallery_id?: number | null;
  size?: number;
  height?: number;
  width?: number;
  position?: number;
  filename?: string;
  bucket?: string;
  src: string;
}

export interface PhotoSources {
  th: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface LightboxPhoto {
  alt: string;
  src: string;
}

export interface GalleryModel {
  ID: number;
  CreatedAt: Date;
  UpdatedAt: Date;
  DeletedAt: Date | null;
  images: Photo[];
  featured_image: Photo;
  title: string;
  path: string;
  event_date: Date | null;
  live: Date;
  public: boolean;
  protected: boolean;
  expiration: Date;
  images_count: number | null;
  zips_ready: boolean;
  reminder: boolean;
  reminder_emails: string | null;
  hero_enabled: boolean;
  hero_variant: number;
  events: EventModel[];
}

export interface GalleryUpdateModel {
  title?: string;
  path?: string;
  event_date?: Date | dayjs.Dayjs | null;
  live?: Date | dayjs.Dayjs;
  expiration?: Date | dayjs.Dayjs;
  public?: boolean;
  protected?: boolean;
  password?: string | null;
  featured_image_id?: number | null;
  reminder?: boolean | null;
  reminder_emails?: string | null;
  hero_enabled?: boolean | null;
  hero_variant?: number | null;
}

export interface NewGalleryModel {
  title: string;
  path: string;
  event_date: Date | null;
  live: Date;
  public: boolean;
  expiration: Date;
  protected: boolean;
  password: string | null;
  reminder: boolean;
  reminder_emails: string | null;
  hero_enabled: boolean;
}

export interface Event {
  email: string;
  filename: string | null;
}

export interface EventModel {
  ID: number;
  CreatedAt: Date;
  UpdatedAt: Date;
  DeletedAt: Date | null;
  gallery_id: number;
  image_id: number | null;
  requestor: string;
  filename: string;
  size: string;
  bytes: number;
}

export interface UserModel {
  ID: number;
  CreatedAt: Date;
  UpdatedAt: Date;
  DeletedAt: Date | null;
  email: string;
  password?: string | null;
}

export interface AuthModel {
  email: string;
  password: string;
}

export interface Auth2FAModel {
  email: string;
  code: string;
}

export interface CompanyModel {
  ID: number;
  CreatedAt?: Date;
  UpdatedAt?: Date | null;
  DeletedAt?: Date | null;
  name: string;
  email: string;
  website: string;
  logo: string;
  favicon: string;
  socials: SocialModel[];
}

export interface SocialModel {
  ID: number;
  CreatedAt: Date;
  UpdatedAt: Date;
  DeletedAt: Date | null;
  title: string;
  link: string;
}

export interface SettingsModel {
  update: boolean;
  version: string;
  uptime: number;
}

export interface PublicSettingsModel {
  update: boolean;
  new_application?: boolean;
}

export interface UserUpdateModel {
  email?: string | null;
  password?: string | null;
}

// responses

export interface ApiObject {
  method: string;
  headers: any;
  url: string;
  data: any;
}

export interface AuthResponse {
  status: string;
  data: UserModel;
}

export interface LoginResponse {
  status: string;
  data: {
    token?: string;
    user?: UserModel;
    message?: string;
  };
}

export interface CompanyResponse {
  status: string;
  data: CompanyModel;
}

export interface GalleriesResponse {
  status: string;
  data: GalleryModel[];
}

export interface GalleryResponse {
  status: string;
  data: GalleryModel;
}

export interface ImageDeleteResponse {
  status: string;
  data: string;
}

export interface SettingsResponse {
  status: string;
  data: SettingsModel;
}

export interface PublicSettingsResponse {
  status: string;
  data: PublicSettingsModel;
}

// Other

export interface SnacksModel {
  open: boolean;
  severity: "success" | "error" | "warning";
  locked: boolean;
  message: string;
  autoHideDuration?: number | null;
}

export interface ShareMenuItemModel {
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
    muiName: string;
  };
  title: string;
  value: string;
}
