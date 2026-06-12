import { homeBackgroundImages } from "../constants.js";

export function HomeBackground({ isVisible }: { isVisible: boolean }) {
  const columnCount = 5;
  const columns = Array.from({ length: columnCount }, (_, columnIndex) =>
    homeBackgroundImages.filter((_, imageIndex) => imageIndex % columnCount === columnIndex)
  );

  return (
    <div className={isVisible ? "home-background visible" : "home-background"} aria-hidden="true">
      {columns.map((images, columnIndex) => (
        <div className="home-bg-column" key={columnIndex}>
          {[...images, ...images].map((image, imageIndex) => (
            <img alt="" decoding="async" key={`${columnIndex}-${imageIndex}`} loading="lazy" src={image} />
          ))}
        </div>
      ))}
    </div>
  );
}
