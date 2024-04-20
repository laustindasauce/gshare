import api from "@/lib/api";
import { GalleryModel, SnacksModel } from "@/lib/models";
import { FolderZipSharp } from "@mui/icons-material";
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
import React from "react";

type Props = {
  gallery: GalleryModel;
  setSnackBar: React.Dispatch<React.SetStateAction<SnacksModel>>;
};

const ZipGalleryButton = ({ gallery, setSnackBar }: Props) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const create = () => {
    setLoading(true);
    api
      .createGalleryImageZips(gallery.ID)
      .then(() => {
        setSnackBar({
          severity: "success",
          message: "ZIP files created.",
          open: true,
          locked: false,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setSnackBar({
          severity: "error",
          message: "ZIP files creation failed.",
          open: true,
          locked: false,
        });
        setLoading(false);
      })
      .finally(() => setOpen(false));
  };

  return (
    <React.Fragment>
      <Button
        disabled={gallery.images.length === 0 || gallery.zips_ready}
        onClick={() => setOpen(true)}
        variant="outlined"
        color="secondary"
        startIcon={<FolderZipSharp />}
      >
        {gallery.zips_ready ? "ZIP files ready" : "ZIP Images"}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Prepare Gallery ZIP Files</DialogTitle>
        <DialogContent>
          <Alert sx={{ mb: 2 }} severity="warning">
            You should only do this once you&apos;ve finished uploading images.
          </Alert>
          <DialogContentText>
            After clicking &apos;create&apos;, the server will generate ZIP
            files to expedite downloads on the client side. This process
            involves preparing ZIP files for both the web and original-sized
            gallery, and storing them within your images directory.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            If you generate ZIP files and subsequently upload a new image or
            delete an image from the gallery, it is necessary to regenerate the
            ZIP files. If you don&apos;t, the ZIP files will still be generated
            on demand to avoid any missing or extra images in the download.
          </DialogContentText>
          <Alert sx={{ mt: 2 }}>
            The duration of ZIP creation may vary based on several factors,
            primarily influenced by the size of your gallery.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <LoadingButton
            loading={loading}
            onClick={create}
            variant="contained"
            color="primary"
          >
            Create
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default ZipGalleryButton;
