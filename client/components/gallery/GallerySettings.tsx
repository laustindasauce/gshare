import React, { useState } from "react";
import {
  TextField,
  Button,
  FormControlLabel,
  Switch,
  FormGroup,
  FormControl,
  FormLabel,
  Stack,
} from "@mui/material";
import { GalleryModel, GalleryUpdateModel } from "@/lib/models";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { LoadingButton } from "@mui/lab";
import DeleteGalleryPrompt from "./DeleteGalleryPrompt";

interface GallerySettingsProps {
  onUpdate: (data: GalleryUpdateModel) => void;
  gallery: GalleryModel;
  loading: boolean;
}

const GallerySettings: React.FC<GallerySettingsProps> = ({
  onUpdate,
  gallery,
  loading,
}) => {
  const [formData, setFormData] = useState<GalleryUpdateModel>({
    title: gallery.title,
    path: gallery.path,
    event_date: !!gallery.event_date
      ? dayjs(gallery.event_date)
      : gallery.event_date,
    live: dayjs(gallery.live),
    expiration: dayjs(gallery.expiration),
    public: gallery.public,
    protected: gallery.protected,
    reminder: gallery.reminder,
    reminder_emails: gallery.reminder_emails,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleInputChange = (key: keyof GalleryUpdateModel, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    onUpdate(formData);
  };

  return (
    <React.Fragment>
      <form>
        <TextField
          label="Title"
          value={formData.title || ""}
          onChange={(e) => handleInputChange("title", e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Path"
          value={formData.path || ""}
          onChange={(e) => handleInputChange("path", e.target.value)}
          fullWidth
          margin="normal"
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            sx={{ minWidth: "100%", mt: 2 }}
            label="Event Date"
            value={dayjs(formData.event_date)}
            onChange={(newValue) =>
              handleInputChange("event_date", newValue || dayjs(new Date()))
            }
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            sx={{ minWidth: "100%", mt: 2 }}
            label="Live Date *"
            value={dayjs(formData.live)}
            onChange={(newValue) =>
              handleInputChange("live", newValue || dayjs(new Date()))
            }
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            sx={{ minWidth: "100%", mt: 2 }}
            label="Expiration Date *"
            value={dayjs(formData.expiration)}
            onChange={(newValue) =>
              handleInputChange(
                "expiration",
                newValue || dayjs(formData.live).add(1, "month")
              )
            }
            minDate={dayjs(formData.live).add(1, "day")}
          />
        </LocalizationProvider>
        <FormControl sx={{ mt: 1 }}>
          <FormLabel>Visibility</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.public || false}
                  onChange={(e) =>
                    handleInputChange("public", e.target.checked)
                  }
                />
              }
              label="Public"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.protected || false}
                  onChange={(e) =>
                    handleInputChange("protected", e.target.checked)
                  }
                />
              }
              label="Protected"
            />
          </FormGroup>
        </FormControl>
        <FormControl sx={{ mt: 1 }}>
          <FormLabel>Automation</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.reminder || false}
                  onChange={(e) =>
                    handleInputChange("reminder", e.target.checked)
                  }
                />
              }
              label="Reminder"
            />
          </FormGroup>
        </FormControl>
        {formData.reminder && (
          <>
            <TextField
              label="Emails"
              type="text"
              value={formData.reminder_emails || ""}
              onChange={(e) =>
                handleInputChange("reminder_emails", e.target.value)
              }
              fullWidth
              margin="normal"
              helperText="The emails to send the reminder to. Separated by a space, you can add as many emails as you'd like."
              placeholder="bride@gmail.com groom@gmail.com"
            />
          </>
        )}
        {formData.protected && (
          <>
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password || ""}
              onChange={(e) => handleInputChange("password", e.target.value)}
              fullWidth
              margin="normal"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showPassword}
                  onChange={() => setShowPassword((prevValue) => !prevValue)}
                />
              }
              label="Show Password"
            />
          </>
        )}
        <Stack sx={{ mt: 2 }} direction="row" justifyContent="space-between">
          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
          <LoadingButton
            loading={loading}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Update
          </LoadingButton>
        </Stack>
      </form>
      <DeleteGalleryPrompt
        gallery={gallery}
        open={deleteOpen}
        handleClose={() => setDeleteOpen(false)}
      />
    </React.Fragment>
  );
};

export default GallerySettings;
