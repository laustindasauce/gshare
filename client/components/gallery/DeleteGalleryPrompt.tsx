import api from "@/lib/api";
import { GalleryModel } from "@/lib/models";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

type Props = {
  gallery: GalleryModel;
  open: boolean;
  handleClose: () => void;
};

const DeleteGalleryPrompt = ({ gallery, open, handleClose }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const router = useRouter();

  const handleDelete = () => {
    setLoading(true);

    api
      .deleteGallery(gallery.ID)
      .then(() => router.push("/admin/dashboard"))
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Delete {gallery.title}</DialogTitle>
      <DialogContent>
        <Alert sx={{ mb: 2 }} severity="warning">
          This action cannot be undone.
        </Alert>
        {error && (
          <Alert sx={{ mb: 2, mt: 2 }} severity="error">
            Something went wrong while deleting the gallery. Please check the
            server logs.
          </Alert>
        )}
        <DialogContentText>
          The gallery and all images associated with the gallery will be
          permanently removed. Please double check that you intend to delete the
          gallery &apos;{gallery.title}&apos;.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton
          loading={loading}
          onClick={handleDelete}
          variant="outlined"
          color="error"
        >
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteGalleryPrompt;
