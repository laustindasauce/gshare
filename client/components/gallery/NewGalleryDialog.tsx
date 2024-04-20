import { formatPath } from "@/helpers/format";
import api from "@/lib/api";
import { GalleryModel } from "@/lib/models";
import { Settings } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Switch,
  TextField,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React from "react";

type Props = {
  open: boolean;
  handleClose: () => void;
  handleCreated: (gallery: GalleryModel) => void;
};

const NewGalleryDialog = ({ open, handleClose, handleCreated }: Props) => {
  const minDate = dayjs(new Date());
  const [live, setLive] = React.useState<dayjs.Dayjs>(dayjs(new Date()));
  const [eventDate, setEventDate] = React.useState<dayjs.Dayjs | null>(null);
  const [expiration, setExpiration] = React.useState<dayjs.Dayjs>(
    live.add(1, "month")
  );
  const [advanced, setAdvanced] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [path, setPath] = React.useState("");
  const [isPublic, setPublic] = React.useState(false);
  const [reminder, setReminder] = React.useState(false);
  const [reminderEmails, setReminderEmails] = React.useState<String | null>();

  const [isProtected, setProtected] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState<String | null>();

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const clean = () => {
    setEventDate(null);
    setLive(dayjs(new Date()));
    setExpiration(dayjs(new Date()).add(1, "month"));
    setAdvanced(false);
    setTitle("");
    setPath("");
    setPublic(false);
    setLoading(false);
    setErrorMsg("");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        component: "form",
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          setLoading(true);
          api
            .createGallery({
              title,
              path,
              event_date: !!eventDate ? eventDate.toDate() : eventDate,
              live: live.toDate(),
              public: isPublic,
              expiration: expiration.toDate(),
            })
            .then((res) => {
              clean();
              setLoading(false);
              handleCreated(res.data);
              handleClose();
            })
            .catch((err) => {
              setErrorMsg(`Something went wrong creating your gallery: ${err}`);
              console.error(err);
            });
        },
      }}
    >
      <DialogTitle>New Gallery</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter the information for your new gallery!
        </DialogContentText>

        {errorMsg.length > 0 && (
          <Alert
            onClose={() => setErrorMsg("")}
            severity="error"
            sx={{ width: "100%" }}
          >
            {errorMsg}
          </Alert>
        )}

        <TextField
          autoFocus
          required
          margin="dense"
          id="title"
          name="title"
          label="Title"
          type="text"
          value={title}
          onChange={(e) => {
            setPath(formatPath(e.target.value));
            setTitle(e.target.value);
          }}
          fullWidth
          variant="outlined"
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            sx={{ minWidth: "100%", mt: 2 }}
            label="Event Date"
            value={eventDate}
            onChange={(newValue) => setEventDate(newValue || dayjs(new Date()))}
            slotProps={{
              textField: {
                helperText:
                  "Optional date that the event for this gallery occurred.",
              },
            }}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            sx={{ minWidth: "100%", mt: 2 }}
            label="Live Date *"
            minDate={minDate}
            value={live}
            onChange={(newValue) => setLive(newValue || dayjs(new Date()))}
            slotProps={{
              textField: {
                helperText: "The date that the gallery will go live.",
              },
            }}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            sx={{ minWidth: "100%", mt: 2 }}
            label="Expiration Date *"
            value={expiration}
            onChange={(newValue) =>
              setExpiration(newValue || live.add(1, "month"))
            }
            minDate={live.add(1, "day")}
            slotProps={{
              textField: {
                helperText:
                  "The date that the gallery will auto-expire. The client will no longer be able to access this gallery after this date.",
              },
            }}
          />
        </LocalizationProvider>

        {/* advanced settings for gallery */}
        {advanced && (
          <React.Fragment>
            <TextField
              sx={{ mt: 2 }}
              autoFocus
              required
              fullWidth
              margin="dense"
              id="path"
              name="path"
              label="Path"
              type="text"
              value={path}
              onChange={(e) => setPath(formatPath(e.target.value))}
              helperText={`The url path for the gallery. Ex: http://mygallery.com/${path}`}
              variant="outlined"
            />
            <FormControl component="fieldset" variant="standard">
              <FormLabel>Visibility</FormLabel>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPublic}
                    onChange={() => setPublic(!isPublic)}
                    name="public"
                  />
                }
                label="Public"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={isProtected}
                    onChange={(e) => setProtected(e.target.checked)}
                  />
                }
                label="Protected"
              />
            </FormControl>
            {isProtected && (
              <>
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password || ""}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showPassword}
                      onChange={() =>
                        setShowPassword((prevValue) => !prevValue)
                      }
                    />
                  }
                  label="Show Password"
                />
              </>
            )}
            <br />
            <FormControl sx={{ mt: 1 }}>
              <FormLabel>Automation</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reminder}
                      onChange={(e) => setReminder(e.target.checked)}
                    />
                  }
                  label="Reminder"
                />
              </FormGroup>
            </FormControl>
            {reminder && (
              <>
                <TextField
                  label="Emails"
                  type="text"
                  value={reminderEmails || ""}
                  onChange={(e) => setReminderEmails(e.target.value)}
                  fullWidth
                  margin="normal"
                  helperText="The emails to send the reminder to. Separated by a space, you can add as many emails as you'd like."
                  placeholder="bride@gmail.com groom@gmail.com"
                />
              </>
            )}
          </React.Fragment>
        )}

        <Grid
          sx={{ mt: 3 }}
          container
          justifyContent="space-between"
          spacing={2}
        >
          <Grid xs="auto">
            <Button
              endIcon={<Settings />}
              disabled={advanced}
              onClick={() => setAdvanced(true)}
            >
              Advanced options
            </Button>
          </Grid>
          <Grid xs="auto">
            <Button
              sx={{ mr: 1 }}
              color="error"
              variant="outlined"
              onClick={() => {
                clean();
                handleClose();
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              loading={loading}
              color="primary"
              variant="contained"
              type="submit"
            >
              Create
            </LoadingButton>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default NewGalleryDialog;
