import {
  Button,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React from "react";
import GalleryQRCode from "./GalleryQRCode";
import { GalleryModel, ShareMenuItemModel, SnacksModel } from "@/lib/models";
import { Link, QrCode, Share } from "@mui/icons-material";

type Props = {
  gallery: GalleryModel;
  setSnackBar: React.Dispatch<React.SetStateAction<SnacksModel>>;
};

const items: ShareMenuItemModel[] = [
  {
    icon: Link,
    title: "Direct Link",
    value: "link",
  },
  {
    icon: QrCode,
    title: "QR Code",
    value: "qr",
  },
];

const GalleryShareButton = ({ gallery, setSnackBar }: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [showQR, setShowQR] = React.useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleItemClick = async (item: ShareMenuItemModel) => {
    if (item.value === "qr") {
      setShowQR(true);
    } else if (item.value === "link") {
      await navigator.clipboard.writeText(
        process.env.NEXT_PUBLIC_CLIENT_URL + "/" + gallery.path
      );
      setSnackBar({
        open: true,
        severity: "success",
        message: "Link copied to clipboard",
        locked: false,
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Button
        startIcon={<Share />}
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        color="info"
        onClick={handleClick}
      >
        Share
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {items.map((item) => (
          <MenuItem key={item.value} onClick={() => handleItemClick(item)}>
            <ListItemIcon>
              <item.icon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">{item.title}</Typography>
          </MenuItem>
        ))}
      </Menu>

      <GalleryQRCode
        open={showQR}
        handleClose={() => setShowQR(false)}
        galleryID={gallery.ID}
      />
    </React.Fragment>
  );
};

export default GalleryShareButton;
