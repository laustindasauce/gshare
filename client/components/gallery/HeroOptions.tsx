import { GalleryUpdateModel } from "@/lib/models";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import Image from "next/image";
import React from "react";

type Props = {
  heroVariant: number;
  loading: boolean;
  onUpdate: (data: GalleryUpdateModel) => void;
};

const HeroOptions = ({ heroVariant, loading, onUpdate }: Props) => {
  const [opt, setOpt] = React.useState(heroVariant);

  const getInfoText = () => {
    switch (opt) {
      case 0:
        return "The default hero displays the featured image over the entire screen. It displays your logo in the center with the gallery title below and a button that will scroll you to the top of the gallery section.";
      case 1:
        return "The first alternate hero displays the featured image over half of the screen. It displays your logo in the center with the gallery title in the top left corner with the photographer's name below.";
    }
  };

  return (
    <Stack spacing={3}>
      <FormControl>
        <FormLabel id="hero-options-group">Hero Display</FormLabel>
        <RadioGroup
          aria-labelledby="hero-options-group"
          value={opt}
          onChange={(e) => setOpt(Number(e.target.value))}
          name="hero-opt-group"
        >
          <FormControlLabel value={0} control={<Radio />} label="Default" />
          <FormControlLabel value={1} control={<Radio />} label="Alt1" />
        </RadioGroup>
      </FormControl>
      <LoadingButton
        sx={{ maxWidth: "150px" }}
        variant="contained"
        loading={loading}
        onClick={() => onUpdate({ hero_variant: opt })}
        disabled={opt === heroVariant}
      >
        Update
      </LoadingButton>
      <Typography>{getInfoText()}</Typography>
      <Box position="relative" width="100%" height="60vh">
        {opt === 0 && (
          <Image
            src="https://i.imgur.com/BkVMAgT.png"
            alt="default"
            fill
            objectFit="contain"
          />
        )}
        {opt === 1 && (
          <Image
            src="https://i.imgur.com/uiZxBWy.png"
            alt="alt1"
            fill
            objectFit="contain"
          />
        )}
      </Box>
    </Stack>
  );
};

export default HeroOptions;
