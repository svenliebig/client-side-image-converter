import React, { useState } from "react";
import i18n from "../i18n/i18n";
import { ImageCanvas } from "./ImageCanvas";
import { ImageDropZone } from "./ImageDropZone";
import { ImageEditor } from "./ImageEditor";

export const App: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [isMultipleImages, setIsMultipleImages] = useState(false);

  const handleImagesAccepted = (files: File[]) => {
    setImages(files);
    setIsMultipleImages(files.length > 1);
  };

  const handleReset = () => {
    setImages([]);
    setIsMultipleImages(false);
  };

  const handleCanvasSave = async (canvas: HTMLCanvasElement) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "composition.png", { type: "image/png" });
      setImages([file]);
      setIsMultipleImages(false);
    }, "image/png");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        {i18n.t("app.name")}
      </h1>
      {images.length === 0 ? (
        <ImageDropZone onImagesAccepted={handleImagesAccepted} />
      ) : isMultipleImages ? (
        <ImageCanvas
          images={images}
          onReset={handleReset}
          onSave={handleCanvasSave}
        />
      ) : (
        <ImageEditor imageFile={images[0]} onReset={handleReset} />
      )}
    </div>
  );
};
