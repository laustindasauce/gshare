import { AddCircleOutline } from "@mui/icons-material";
import { Button } from "@mui/material";
import React from "react";
import NewGalleryDialog from "./NewGalleryDialog";
import { GalleryModel } from "@/lib/models";

type Props = {
  handleCreated: (gallery: GalleryModel) => void;
};

const NewGalleryButton = (props: Props) => {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <Button
        startIcon={<AddCircleOutline />}
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
      >
        Create Gallery
      </Button>
      <NewGalleryDialog
        open={open}
        handleClose={() => setOpen(false)}
        handleCreated={props.handleCreated}
      />
    </React.Fragment>
  );
};

export default NewGalleryButton;
