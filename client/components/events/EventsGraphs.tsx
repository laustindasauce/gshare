import React from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { EventModel } from "@/lib/models";
import {
  bytesToGigabytes,
  bytesToKilobytes,
  bytesToMegabytes,
  formatNumberWithCommas,
  getEventsImagesCountGraph,
  getEventsResolutionDifference,
} from "@/helpers/format";
import { DefaultizedPieValueType, Gauge } from "@mui/x-charts";
import Grid from "@mui/material/Unstable_Grid2";
import { Divider, Paper, Typography } from "@mui/material";

type Props = {
  events: EventModel[];
};

const EventsGraphs = ({ events }: Props) => {
  const eventsData = getEventsImagesCountGraph(events);
  const resolutionData = getEventsResolutionDifference(events);

  const TOTAL = resolutionData
    .map((item) => item.value)
    .reduce((a, b) => a + b, 0);

  const TOTAL_BYTES = resolutionData
    .map((item) => item.bytes)
    .reduce((a, b) => a + b, 0);

  const getArcLabel = (params: DefaultizedPieValueType) => {
    const percent = params.value / TOTAL;
    return `${(percent * 100).toFixed(0)}%`;
  };

  const size = {
    width: 400,
    height: 200,
  };

  return (
    <Grid container sx={{ mb: 5 }} spacing={2} justifyContent="center">
      <Grid xs={"auto"}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5">Gallery Download Stats</Typography>
          <Divider />
          <Typography mt={2}>
            {formatNumberWithCommas(
              Number(bytesToKilobytes(TOTAL_BYTES).toFixed(2))
            )}{" "}
            KB
          </Typography>
          <Typography>
            {formatNumberWithCommas(
              Number(bytesToMegabytes(TOTAL_BYTES).toFixed(2))
            )}{" "}
            MB
          </Typography>
          <Typography>
            {formatNumberWithCommas(
              Number(bytesToGigabytes(TOTAL_BYTES).toFixed(2))
            )}{" "}
            GB
          </Typography>
        </Paper>
      </Grid>
      <Grid xs={12} />
      <Grid xs={12} sm={6}>
        <PieChart
          series={[
            {
              arcLabel: (item) => `${item.value}`,
              arcLabelMinAngle: 45,
              data: eventsData,
            },
          ]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: "white",
              fontWeight: "bold",
            },
          }}
          {...size}
        />
      </Grid>
      <Grid xs={12} sm={6}>
        <PieChart
          series={[
            {
              outerRadius: 80,
              data: resolutionData,
              arcLabel: getArcLabel,
            },
          ]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: "white",
              fontSize: 14,
            },
          }}
          {...size}
        />
      </Grid>
    </Grid>
  );
};

export default EventsGraphs;
