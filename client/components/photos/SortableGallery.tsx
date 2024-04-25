import React from "react";
import {
  Alert,
  ImageList,
  Snackbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { LoadingButton } from "@mui/lab";
import { Photo } from "@/lib/models";
import api from "@/lib/api";
import SortableImage from "./SortableImage";

type Props = {
  images: Photo[];
  galleryID: number;
};

const SortableGallery = (props: Props) => {
  const [snackbar, setSnackbar] = React.useState<any>(null);
  const handleCloseSnackbar = () => setSnackbar(null);

  const [warned, setWarned] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [photos, setPhotos] = React.useState(props.images.map((s) => s.ID));

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));
  const getCols = () => {
    let cols = 5;
    if (isXs) {
      cols = 2;
    } else if (isSm) {
      cols = 3;
    } else if (isMd) {
      cols = 4;
    } else if (isLg) {
      cols = 4;
    }

    return cols;
  };

  // const handleDragStart = (event) => {
  //   setActiveId(event.active.id);
  // };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = photos.indexOf(active.id);
      const newIndex = photos.indexOf(over.id);
      const newItemsOrder = arrayMove(photos, oldIndex, newIndex);
      setPhotos(newItemsOrder);

      if (!warned) {
        setSnackbar({
          children:
            "Don't forget to save your new gallery order before leaving!",
          severity: "warning",
        });
        setWarned(true);
      }
    }

    // setActiveId(null);
  };

  // const handleDragCancel = () => {
  //   setActiveId(null);
  // };

  const updateImageOrder = () => {
    setLoading(true);
    api
      .updateGalleryImagesOrder(props.galleryID, photos)
      .then(() => {
        setSnackbar({
          ...snackbar,
          severity: "success",
          message: `Your gallery order was saved.`,
          open: true,
        });
        setWarned(false);
      })
      .catch((error: any) => {
        setSnackbar({
          ...snackbar,
          message: "Error occurred trying to update the gallery order.",
          severity: "error",
          open: true,
        });
        console.error(error);
      })
      .finally(() => setLoading(false));
  };

  return (
    <React.Fragment>
      {warned && (
        <LoadingButton
          loading={loading}
          variant="contained"
          color="warning"
          onClick={updateImageOrder}
        >
          Save Order
        </LoadingButton>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        // onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        // onDragCancel={handleDragCancel}
      >
        <SortableContext items={photos} strategy={rectSortingStrategy}>
          <ImageList variant="masonry" cols={getCols()} gap={6}>
            {photos.map((id, idx) => {
              return (
                <SortableImage
                  key={id}
                  index={idx}
                  {...props}
                  photo={props.images.find((x) => x.ID === id) as Photo}
                />
              );
            })}
          </ImageList>
        </SortableContext>
      </DndContext>
      {!!snackbar && (
        <Snackbar
          open
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          onClose={handleCloseSnackbar}
          autoHideDuration={10000}
        >
          <Alert {...snackbar} onClose={handleCloseSnackbar} />
        </Snackbar>
      )}
    </React.Fragment>
  );
};

export default SortableGallery;
