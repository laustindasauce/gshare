import { getGalleryQRCodeURL } from "@/helpers/photos";
import { Dialog, DialogContent } from "@mui/material";
import Image from "next/image";
import React from "react";

type Props = {
  galleryID: number;
  open: boolean;
  handleClose: () => void;
};

const GalleryQRCode = (props: Props) => {
  return (
    <React.Fragment>
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        maxWidth="sm"
        // fullWidth
      >
        <DialogContent>
          <Image
            alt="QR Code"
            src={getGalleryQRCodeURL(props.galleryID)}
            height={256}
            width={256}
          />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default GalleryQRCode;
