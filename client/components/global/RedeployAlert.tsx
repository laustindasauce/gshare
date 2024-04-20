import { Alert, Box, Collapse, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";
import { useApiStatus } from "@/lib/swr";
import api from "@/lib/api";

const RedeployAlert = () => {
  const { status, isLoading, isError } = useApiStatus("status-key");
  const [close, setClose] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  if (isLoading || isError) {
    return null;
  }

  const handleClick = () => {
    setLoading(true);
    api
      .redeploySite()
      .then(() => setClose(true))
      .catch((err) => alert(err))
      .finally(() => setLoading(false));
  };

  const handleClose = () => {
    setClose(true);
    api
      .updateSettings()
      .then(() => {})
      .catch((err) => alert(err));
  };

  return (
    <Collapse in={close ? false : status?.update}>
      <Alert
        severity="warning"
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ mb: 2 }}
      >
        {loading ? (
          <Typography>Redeploying...</Typography>
        ) : (
          <Box className="link" onClick={handleClick}>
            <Typography>
              Click anywhere on this alert text once you&apos;ve finished your
              changes so that they are updated on your site!
            </Typography>
          </Box>
        )}
      </Alert>
    </Collapse>
  );
};

export default RedeployAlert;
