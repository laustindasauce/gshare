import { shimmer, toBase64 } from "@/helpers/photos";
import Image, { StaticImageData } from "next/image";
import {
  RenderSlideProps,
  isImageFitCover,
  useLightboxProps,
  useLightboxState,
  isImageSlide,
  Slide,
} from "yet-another-react-lightbox";

function isNextJsImage(slide: Slide): slide is StaticImageData {
  return (
    isImageSlide(slide) &&
    typeof slide.width === "number" &&
    typeof slide.height === "number"
  );
}

/*
 * For JavaScript version of this sandbox please visit
 * https://codesandbox.io/p/sandbox/yet-another-react-lightbox-nextjs-bfjgb0?file=%2Fpages%2Findex.jsx
 */
export default function NextLightboxImage({
  slide,
  offset,
  rect,
}: RenderSlideProps) {
  const {
    on: { click },
    carousel: { imageFit },
  } = useLightboxProps();

  const { currentIndex } = useLightboxState();

  const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit);

  if (!isNextJsImage(slide)) return undefined;

  const width = !cover
    ? Math.round(
        Math.min(rect.width, (rect.height / slide.height) * slide.width)
      )
    : rect.width;

  const height = !cover
    ? Math.round(
        Math.min(rect.height, (rect.width / slide.width) * slide.height)
      )
    : rect.height;

  return (
    <div style={{ position: "relative", width, height }}>
      <Image
        fill
        alt=""
        src={slide}
        loading="eager"
        quality="100"
        draggable={true}
        placeholder="blur"
        style={{
          objectFit: cover ? "cover" : "contain",
          cursor: click ? "pointer" : undefined,
        }}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
        onClick={
          offset === 0 ? () => click?.({ index: currentIndex }) : undefined
        }
      />
    </div>
  );
}
