import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { EventModel, SnacksModel } from "@/lib/models";
import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { DeleteForeverRounded, ExitToApp } from "@mui/icons-material";
import api from "@/lib/api";
import { bytesToSize } from "@/helpers/format";
import { getImageSrc } from "@/helpers/photos";

type Props = {
  events: EventModel[];
  setSnackBar: React.Dispatch<React.SetStateAction<SnacksModel>>;
};

const EventsTable = (props: Props) => {
  const [events, setEvents] = React.useState<EventModel[]>(props.events);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loading, setLoading] = React.useState<number | null>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleDeleteEvent = (id: number) => {
    setLoading(id);

    api
      .deleteEvent(id)
      .then(() => {
        setEvents((prev) => prev.filter((e) => e.ID !== id));
        props.setSnackBar({
          open: true,
          severity: "success",
          message: "Event deleted successfully!",
          locked: false,
        });
      })
      .catch((err) => {
        console.error(err);
        props.setSnackBar({
          open: true,
          severity: "error",
          message: "Error deleting event",
          locked: false,
        });
      })
      .finally(() => setLoading(null));
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>Resolution</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Size</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((event) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={event.ID}>
                    <TableCell>
                      {!event.image_id ? "Gallery" : "Single Photo"}
                    </TableCell>
                    <TableCell>{event.size}</TableCell>
                    <TableCell>{event.requestor}</TableCell>
                    <TableCell>
                      {dayjs(event.CreatedAt).format("MMM DD, YYYY - H:mm A")}
                    </TableCell>
                    <TableCell align="right">
                      {bytesToSize(event.bytes || 0)}
                    </TableCell>
                    <TableCell align="right">
                      <Stack justifyContent="end" direction="row">
                        <Tooltip title={!event.image_id ? "" : "View Image"}>
                          <IconButton
                            disabled={!event.image_id}
                            onClick={() => {
                              window.open(
                                getImageSrc(event.image_id as number) +
                                  `/${event.size}/100`,
                                "_blank"
                              );
                            }}
                          >
                            <ExitToApp />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Event">
                          <IconButton
                            disabled={loading === event.ID}
                            onClick={() => handleDeleteEvent(event.ID)}
                          >
                            <DeleteForeverRounded />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={events.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default EventsTable;
