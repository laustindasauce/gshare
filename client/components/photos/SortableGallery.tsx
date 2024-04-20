import * as React from "react";
import { Photo, PhotoAlbum, RenderPhotoProps } from "react-photo-album";
import {
  Photo as PhotoModel,
  SnacksModel,
  SortablePhotoModel,
} from "@/lib/models";
import clsx from "clsx";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";

import { getImageSrc, shimmer, toBase64 } from "@/helpers/photos";
import Image from "next/image";
import api from "@/lib/api";
import Snacks from "../global/Snacks";
import { LoadingButton } from "@mui/lab";

interface SortablePhoto extends Photo {
  id: UniqueIdentifier;
}

type SortablePhotoProps = RenderPhotoProps<SortablePhoto>;

type PhotoFrameProps = SortablePhotoProps & {
  overlay?: boolean;
  active?: boolean;
  insertPosition?: "before" | "after";
  attributes?: Partial<React.HTMLAttributes<HTMLDivElement>>;
  listeners?: Partial<React.HTMLAttributes<HTMLDivElement>>;
};

const PhotoFrame = React.memo(
  React.forwardRef<HTMLDivElement, PhotoFrameProps>(function PhotoFrame(
    props,
    ref
  ) {
    const {
      layoutOptions,
      imageProps,
      overlay,
      active,
      insertPosition,
      attributes,
      listeners,
      photo,
      wrapperStyle,
    } = props;
    const { alt, style, src, height, width, ...restImageProps } = imageProps;

    return (
      <div
        ref={ref}
        style={{ ...wrapperStyle, position: "relative" }}
        className={clsx("photo-frame", {
          overlay: overlay,
          active: active,
          insertBefore: insertPosition === "before",
          insertAfter: insertPosition === "after",
        })}
        {...attributes}
        {...listeners}
      >
        <Image
          className="img-link"
          fill
          alt={alt}
          src={photo}
          draggable={true}
          placeholder={`data:image/svg+xml;base64,${toBase64(
            shimmer(photo.width, photo.height)
          )}`}
          quality="75"
          loading="lazy"
        />
      </div>
    );
  })
);

function SortablePhotoFrame(
  props: SortablePhotoProps & { activeIndex?: number }
) {
  const { photo, activeIndex } = props;
  const { attributes, listeners, isDragging, index, over, setNodeRef } =
    useSortable({ id: photo.id });

  return (
    <PhotoFrame
      ref={setNodeRef}
      active={isDragging}
      insertPosition={
        activeIndex !== undefined && over?.id === photo.id && !isDragging
          ? index > activeIndex
            ? "after"
            : "before"
          : undefined
      }
      aria-label="sortable image"
      attributes={attributes}
      listeners={listeners}
      {...props}
    />
  );
}

type Props = {
  galleryID: number;
  images: PhotoModel[];
};

export default function SortableGallery(props: Props) {
  const [photos, setPhotos] = React.useState(
    props.images.map(
      (photo) =>
        ({
          id: photo.ID,
          src: getImageSrc(photo.ID),
          width: photo.width,
          height: photo.height,
          alt: `${photo.ID}`,
          key: `${photo.gallery_id}`,
          blurDataURL: `data:image/svg+xml;base64,${toBase64(
            shimmer(photo.width, photo.height)
          )}`,
          download: photo.filename,
        } as SortablePhotoModel)
    )
  );
  const renderedPhotos = React.useRef<{ [key: string]: SortablePhotoProps }>(
    {}
  );
  const [activeId, setActiveId] = React.useState<UniqueIdentifier>();
  const activeIndex = activeId
    ? photos.findIndex((photo) => photo.id === activeId)
    : undefined;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 50, tolerance: 10 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [warned, setWarned] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [snackbar, setSnackbar] = React.useState<SnacksModel>({
    open: false,
    severity: "success",
    locked: false,
    message: "",
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDragStart = React.useCallback(
    ({ active }: DragStartEvent) => setActiveId(active.id),
    []
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setPhotos((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);

          return arrayMove(items, oldIndex, newIndex);
        });

        if (!warned) {
          setSnackbar({
            ...snackbar,
            message:
              "Don't forget to save your new gallery order before leaving!",
            severity: "warning",
            open: true,
          });
          setWarned(true);
        }
      }

      setActiveId(undefined);
    },
    [snackbar, warned]
  );

  const renderPhoto = (props: SortablePhotoProps) => {
    // capture rendered photos for future use in DragOverlay
    renderedPhotos.current[props.photo.id] = props;
    return <SortablePhotoFrame activeIndex={activeIndex} {...props} />;
  };

  const updateImageOrder = () => {
    setLoading(true);
    api
      .updateGalleryImagesOrder(
        props.galleryID,
        photos.map((s) => s.id)
      )
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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={photos.map((s) => Number(s.alt))}>
          <div style={{ margin: 30 }}>
            <PhotoAlbum
              photos={photos}
              layout="rows"
              spacing={30}
              padding={20}
              renderPhoto={renderPhoto}
            />
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId && (
            <PhotoFrame overlay {...renderedPhotos.current[activeId]} />
          )}
        </DragOverlay>
      </DndContext>
      <Snacks snackbar={snackbar} handleSnackbarClose={handleSnackbarClose} />
    </React.Fragment>
  );
}
