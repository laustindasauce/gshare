import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Image from "next/image";
import { Stack } from "@mui/material";
import api from "@/lib/api";
import { LoadingButton } from "@mui/lab";
import {
  calcImageSize,
  getImageSrc,
  shimmer,
  toBase64,
} from "@/helpers/photos";
import { Photo as PhotoModel } from "@/lib/models";

type Props = {
  handleClose: (arg1: boolean, arg2: string) => void;
  open: boolean;
  image: PhotoModel;
};

const Confirmation = ({ open, handleClose, image }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const deleteImage = async () => {
    try {
      setLoading(true);
      const res = await api.deleteImage(image.ID);
      setLoading(false);
      handleClose(true, res.data);
    } catch (error) {
      setLoading(false);
      console.error(error);
      handleClose(false, "Something went wrong! Image was not deleted.");
    }
  };

  const imgSize = calcImageSize(image.height, image.width, 300, 300);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Delete this photo?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Double check this is the photo you are wanting to delete. This
          can&apos;t be undone!
        </DialogContentText>
        <Stack direction="row" justifyContent="center">
          <Image
            alt={"image to delete"}
            src={getImageSrc(image.ID)}
            quality={Number(process.env.NEXT_PUBLIC_ADMIN_IMAGE_QUALITY || 40)}
            height={imgSize.height}
            width={imgSize.width}
            placeholder={`data:image/svg+xml;base64,${toBase64(
              shimmer(imgSize.width, imgSize.height)
            )}`}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" justifyContent="space-between" spacing={5}>
          <Button
            onClick={() => handleClose(false, "")}
            color="secondary"
            variant="contained"
            autoFocus
          >
            Cancel
          </Button>
          <LoadingButton
            loading={loading}
            variant="outlined"
            onClick={deleteImage}
            color="error"
          >
            Confirm
          </LoadingButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default Confirmation;
