import imageCompression from "browser-image-compression";
import "cropperjs/dist/cropper.css";
import { t } from "i18next";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-cropper";
import { SUPPORTED_IMAGES } from "../utils/images";

interface Props {
  imageFile: File;
  onReset: () => void;
}

export const ImageEditor: React.FC<Props> = ({ imageFile, onReset }) => {
  const cropperRef = useRef<HTMLImageElement & { cropper: Cropper }>(null);
  const [resolution, setResolution] = useState({ width: 0, height: 0 });
  const [selectedScale, setSelectedScale] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showBase64, setShowBase64] = useState(false);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  const handleImageLoad = (e: any) => {
    if (!cropperRef.current?.cropper) return;
    const cropper = cropperRef.current.cropper;
    const cropData = cropper.getData();
    setResolution({
      width: Math.round(cropData.width),
      height: Math.round(cropData.height),
    });
  };

  const getImageData = async (format: string) => {
    if (!cropperRef.current) return;

    const cropper = cropperRef.current?.cropper;
    const canvas = cropper.getCroppedCanvas();

    return new Promise((resolve) => {
      canvas.toBlob(async (blob: Blob | null) => {
        if (!blob) return;

        // Compress the image if it's not SVG
        if (format !== "image/svg+xml") {
          const compressedFile = await imageCompression(
            new File([blob], "", { type: blob.type }),
            {
              // maxSizeMB: 1,
              maxWidthOrHeight: resolution.width,
            }
          );
          resolve(compressedFile);
        } else {
          resolve(new File([blob], "image.svg", { type: "image/svg+xml" }));
        }
      }, format);
    });
  };

  const handleDownload = async (format: string) => {
    setLoading(true);
    try {
      const processedImage = await getImageData(format);
      const url = URL.createObjectURL(processedImage as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${t("editor.image.download-name")}.${format.split("/")[1]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error processing image:", error);
    }
    setLoading(false);
  };

  const handleResolutionChange = (scale: number) => {
    if (!cropperRef.current) return;
    const cropper = cropperRef.current?.cropper;
    const cropData = cropper.getData();
    setResolution({
      width: Math.round(cropData.width * scale),
      height: Math.round(cropData.height * scale),
    });
    setSelectedScale(scale);
  };

  useEffect(() => {
    const handler = () => {
      if (!cropperRef.current) return;
      const cropper = cropperRef.current.cropper;
      const cropData = cropper.getData();
      setResolution({
        width: Math.round(cropData.width * selectedScale),
        height: Math.round(cropData.height * selectedScale),
      });
    };

    cropperRef.current?.addEventListener("crop", handler);
    return () => {
      cropperRef.current?.removeEventListener("crop", handler);
    };
  }, [cropperRef.current, selectedScale]);

  const generateBase64Preview = async (): Promise<string | null> => {
    if (!cropperRef.current) return null;

    const cropper = cropperRef.current.cropper;
    const canvas = cropper.getCroppedCanvas({
      width: resolution.width,
      height: resolution.height,
    });

    if (!canvas) return null;

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }

        // Determine the format from the original file
        const format = imageFile.type || "image/png";

        // Read the blob as Data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          console.error("Error reading blob as Data URL");
          resolve(null);
        };
        reader.readAsDataURL(blob);

        /*
        // Optional: Compress before converting to Base64 if needed
        // This might be redundant if the goal is just a preview string
        if (format !== "image/svg+xml") {
          try {
            const compressedFile = await imageCompression(
              new File([blob], imageFile.name, { type: format }),
              {
                maxWidthOrHeight: resolution.width,
                useWebWorker: true,
              }
            );
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.onerror = () => resolve(null); // Handle reader error
            reader.readAsDataURL(compressedFile);
          } catch (error) {
            console.error("Compression error:", error);
            resolve(null); // Handle compression error
          }
        } else {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = () => resolve(null); // Handle reader error
          reader.readAsDataURL(blob);
        }
        */
      }, imageFile.type || "image/png"); // Use original file type for blob conversion
    });
  };

  return (
    <div className="space-y-8">
      <div className="relative">
        <button
          onClick={onReset}
          className="absolute -top-4 -right-4 bg-gray-200 dark:bg-gray-800 p-2 rounded-full z-10 hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white"
        >
          ✕
        </button>
        <Cropper
          ref={cropperRef as never}
          src={useMemo(() => URL.createObjectURL(imageFile), [imageFile])}
          style={{ height: 400, width: "100%" }}
          guides={true}
          responsive={true}
          onLoad={handleImageLoad}
          viewMode={1}
          autoCropArea={1}
          className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
        />
      </div>

      <div className="flex justify-between items-start gap-8">
        <div className="space-y-4 flex-1">
          <h3 className="text-lg font-semibold dark:text-white">
            {t("editor.download", {
              resolution: `${resolution.width} x ${resolution.height}px`,
            })}
          </h3>
          <div className="flex gap-4">
            {SUPPORTED_IMAGES.map(({ type, name }) => (
              <button
                key={type}
                onClick={() => handleDownload(type)}
                disabled={loading}
                className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold dark:text-white">
            {t("editor.resolution")}
          </h3>
          <div className="flex flex-col gap-2">
            {[1, 0.75, 0.5, 0.25].map((scale) => (
              <button
                key={scale}
                onClick={() => handleResolutionChange(scale)}
                className={`px-4 py-2 text-sm rounded transition-colors
									${
                    selectedScale === scale
                      ? "bg-primary-light dark:bg-primary-dark text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                {scale * 100}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="showBase64Checkbox"
              checked={showBase64}
              onChange={async (e) => {
                const checked = e.target.checked;
                setShowBase64(checked);
                if (checked) {
                  const base64 = await generateBase64Preview();
                  setBase64Image(base64);
                } else {
                  setBase64Image(null);
                }
              }}
              className="mr-2"
            />
            <label
              htmlFor="showBase64Checkbox"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {t("canvas.show-base64")}
            </label>
          </div>
          {showBase64 && base64Image && (
            <textarea
              readOnly
              value={base64Image}
              className="w-full h-32 p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-xs font-mono resize-none"
              placeholder={t("canvas.generating-base64") ?? "Generating..."}
            />
          )}
          {showBase64 && !base64Image && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("canvas.generating-base64") ?? "Generating..."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
