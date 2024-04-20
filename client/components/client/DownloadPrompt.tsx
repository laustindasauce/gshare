import * as React from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  LinearProgress,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@mui/material";
import { emailIsValid } from "@/helpers/validation";
import LoadingBackdrop from "../global/LoadingBackdrop";
import api from "@/lib/api";
import { getImageDownloadURL, getZipDownloadURL } from "@/helpers/photos";
import { LoadingButton } from "@mui/lab";
import { EventModel } from "@/lib/models";

type Props = {
  galleryID: number;
  imageID: number | null;
  fileName: string;
  open: boolean;
  handleClose: () => void;
  zip?: boolean;
};

const DownloadPrompt = ({
  galleryID,
  imageID,
  fileName,
  open,
  handleClose,
  zip,
}: Props) => {
  const [loading, setLoading] = React.useState({ loading: false, info: "" });
  const [downloading, setDownloading] = React.useState(false);
  const [downloadSize, setDownloadSize] = React.useState("original");

  const downloadFile = () => {
    setDownloading(true);
    let anchor = document.createElement("a");
    document.body.appendChild(anchor);
    let file = "";
    const filename = fileName;

    if (zip) {
      file = getZipDownloadURL(galleryID, downloadSize);
    } else {
      file = getImageDownloadURL(imageID as number, downloadSize);
    }

    try {
      fetch(file, {
        method: "GET",
      })
        .then((response) => response.blob())
        .then((blobby) => {
          let objectUrl = window.URL.createObjectURL(blobby);

          anchor.href = objectUrl;
          anchor.download = filename;
          anchor.click();

          window.URL.revokeObjectURL(objectUrl);

          const bytes = blobby.size; // Update bytes to the correct number of bytes in the blobby response

          api.createEvent({
            gallery_id: galleryID,
            image_id: imageID,
            requestor: "download",
            filename: filename,
            size: downloadSize,
            bytes: bytes,
          } as EventModel);
        })
        .catch((err) => {
          console.error(err);
          alert("Unable to download gallery.");
        })
        .finally(safelyClose);
    } catch (error) {
      console.error(error);
      alert("Something went wrong downloading the gallery!");
    }
  };

  const safelyClose = () => {
    setLoading({ loading: false, info: "" });
    setDownloading(false);
    handleClose();
  };

  return (
    <Dialog
      sx={{ zIndex: 999 }}
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={safelyClose}
    >
      <DialogTitle>{zip ? "Download Gallery" : "Download Image"}</DialogTitle>
      {!downloading ? (
        <DialogContent>
          {loading.loading ? (
            <LoadingBackdrop info={loading.info} />
          ) : (
            <Stack spacing={3}>
              <FormControl>
                <FormLabel id="demo-controlled-radio-buttons-group">
                  Image Size
                </FormLabel>
                <RadioGroup
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  value={downloadSize}
                  onChange={(e) => setDownloadSize(e.target.value)}
                >
                  <FormControlLabel
                    value="original"
                    control={<Radio />}
                    label="High Resolution"
                  />
                  <FormControlLabel
                    value="web"
                    control={<Radio />}
                    label="Web Sized"
                  />
                </RadioGroup>
              </FormControl>
              <Button fullWidth onClick={downloadFile} variant="contained">
                Download Now
              </Button>
            </Stack>
          )}
        </DialogContent>
      ) : (
        <DialogContent>
          <LinearProgress sx={{ mb: 2 }} />
          <DialogContentText>
            Your download should prompt shortly. If you are downloading the
            entire gallery it could take some time.
          </DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={safelyClose} color="inherit">
          cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DownloadPrompt;
