import { SnacksModel } from "@/lib/models";
import { Alert, Snackbar } from "@mui/material";
import React from "react";

type Props = {
  snackbar: SnacksModel;
  handleSnackbarClose: () => void;
  vertical?: "top" | "bottom";
  horizontal?: "center" | "left" | "right";
};

const Snacks = ({
  snackbar,
  handleSnackbarClose,
  vertical,
  horizontal,
}: Props) => {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: vertical || "top",
        horizontal: horizontal || "right",
      }}
      open={snackbar.open}
      autoHideDuration={snackbar.autoHideDuration || 6000}
      onClose={handleSnackbarClose}
    >
      <Alert
        onClose={handleSnackbarClose}
        severity={snackbar.severity}
        sx={{ width: "100%" }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default Snacks;
