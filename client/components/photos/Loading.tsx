import * as React from "react";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { normalize } from "@/helpers/photos";

type Props = {
  completed: number;
  total: number;
};

const Loading = ({ completed, total }: Props) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress
          //   variant="determinate"
          color="primary"
          variant="buffer"
          valueBuffer={normalize(completed + 1, 0, total)}
          value={normalize(completed, 0, total)}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          color="text.secondary"
        >{`${completed}/${total}`}</Typography>
      </Box>
    </Box>
  );
};

export default Loading;
