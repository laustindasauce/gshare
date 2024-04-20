import React from "react";
import {
  Alert,
  AlertProps,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Loading from "./Loading";
import api from "@/lib/api";

type Props = {
  open: boolean;
  handleClose: () => void;
  galleryID: number | string;
  handleUploadComplete: (successCount: number, errorCount: number) => void;
};

const Upload = ({
  galleryID,
  open,
  handleClose,
  handleUploadComplete,
}: Props) => {
  const [files, setFiles] = React.useState<FileList>();
  const [loading, setLoading] = React.useState(false);
  const [completed, setCompleted] = React.useState(0);

  const fileSelectedHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files as FileList;
    setFiles(newFiles);
  };

  const finished = (successCount: number, errorCount: number) => {
    setLoading(false);
    setFiles(undefined);
    setCompleted(0);
    handleUploadComplete(successCount, errorCount);
  };

  const uploadImages = async () => {
    setLoading(true);
    if (!files) {
      return;
    }

    let errorCount = 0;
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const uploadData = new FormData();
      uploadData.append("src", files[i]);
      try {
        await api.uploadGalleryImage(uploadData, galleryID);
        setCompleted(i + 1);
        successCount += 1;
      } catch (error) {
        console.error(error);
        errorCount += 1;
      }
    }

    finished(successCount, errorCount);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Image Uploader</DialogTitle>
      <DialogContent>
        <Stack direction="row" justifyContent="space-between">
          <Button
            variant={!!files && files.length > 0 ? "outlined" : "contained"}
            component="label"
          >
            Choose Files
            <input
              type="file"
              accept="image/jpeg, image/png"
              hidden
              multiple
              onChange={fileSelectedHandler}
            />
          </Button>
          {!!files && files.length > 0 && (
            <Typography>{files.length} files selected</Typography>
          )}
          <LoadingButton
            variant="contained"
            color="primary"
            loading={loading}
            disabled={!!files ? files.length === 0 : true}
            onClick={() => uploadImages()}
          >
            Upload Images
          </LoadingButton>
        </Stack>
        <Stack direction="row" justifyContent="center">
          <Button
            onClick={() => setFiles(undefined)}
            color="error"
            disabled={!!files ? files.length === 0 : true}
          >
            Clear Selected
          </Button>
        </Stack>
        {loading && (
          <Loading completed={completed} total={!!files ? files.length : 0} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Upload;
