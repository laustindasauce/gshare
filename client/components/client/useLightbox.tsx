import * as React from "react";
import dynamic from "next/dynamic";
import type {
  DownloadFunctionProps,
  LightboxExternalProps,
  SlideImage,
} from "yet-another-react-lightbox";
import Download from "yet-another-react-lightbox/plugins/download";
import NextLightboxImage from "./NextLightboxImage";
import DownloadPrompt from "./DownloadPrompt";

const Lightbox = dynamic(() => import("./Lightbox"));

export default function useLightbox() {
  const [index, setIndex] = React.useState(-1);
  const [interactive, setInteractive] = React.useState(false);
  const [dlPrompt, setDlPrompt] = React.useState(false);
  const [dlImage, setDlImage] = React.useState<SlideImage | null>(null);
  const [galleryID, setGalleryID] = React.useState<number | null>(null);

  const setLightboxIndex = React.useCallback((i: number) => {
    setIndex(i);
    setInteractive(true);
  }, []);

  const setLightboxGalleryID = React.useCallback(
    (id: number) => {
      if (id !== galleryID) setGalleryID(id);
    },
    [galleryID]
  );

  const renderLightbox = React.useCallback(
    (props?: Omit<LightboxExternalProps, "open" | "close">) =>
      interactive ? (
        <>
          {dlImage && galleryID && (
            <DownloadPrompt
              galleryID={galleryID}
              imageID={Number(dlImage.alt)}
              open={dlPrompt}
              fileName={dlImage.download as string}
              handleClose={() => {
                setDlImage(null);
                setDlPrompt(false);
              }}
            />
          )}
          <Lightbox
            open={index >= 0}
            close={() => setIndex(-1)}
            {...props}
            index={index}
            render={{ slide: NextLightboxImage }}
            download={{
              download: ({ slide, saveAs }: DownloadFunctionProps) => {
                // saveAs(slide.download as string, slide.alt);
                // using the saveAs we can't pass auth token
                setDlImage(slide);
                setDlPrompt(true);
                setIndex(-1);
              },
            }}
            plugins={[Download]}
          />
        </>
      ) : null,
    [index, interactive, dlImage, dlPrompt, galleryID]
  );

  return { setLightboxIndex, setLightboxGalleryID, renderLightbox };
}
