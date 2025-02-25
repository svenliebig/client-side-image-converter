import { t } from "i18next";
import React, { useEffect, useRef, useState } from "react";

interface ImageElement {
  file: File;
  x: number;
  y: number;
  width: number;
  height: number;
  url: string;
  originalWidth: number;
  originalHeight: number;
  zIndex: number;
}

interface Props {
  images: File[];
  onReset: () => void;
  onSave: (canvas: HTMLCanvasElement) => void;
}

const MAX_INITIAL_IMAGE_DIMENSION = 400; // Maximum initial dimension for any image
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

export const ImageCanvas: React.FC<Props> = ({ images, onReset, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const calculateScaledDimensions = (width: number, height: number) => {
    const aspectRatio = width / height;
    let newWidth = width;
    let newHeight = height;

    if (width > height && width > MAX_INITIAL_IMAGE_DIMENSION) {
      newWidth = MAX_INITIAL_IMAGE_DIMENSION;
      newHeight = MAX_INITIAL_IMAGE_DIMENSION / aspectRatio;
    } else if (height > MAX_INITIAL_IMAGE_DIMENSION) {
      newHeight = MAX_INITIAL_IMAGE_DIMENSION;
      newWidth = MAX_INITIAL_IMAGE_DIMENSION * aspectRatio;
    }

    return { width: newWidth, height: newHeight };
  };

  useEffect(() => {
    const loadImages = async () => {
      const elements = await Promise.all(
        images.map(async (file, index) => {
          const url = URL.createObjectURL(file);
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = url;
          });

          const { width, height } = calculateScaledDimensions(
            img.width,
            img.height
          );

          const x = (CANVAS_WIDTH - width) / 2 + index * 50;
          const y = (CANVAS_HEIGHT - height) / 2 + index * 50;

          return {
            file,
            url,
            x,
            y,
            width,
            height,
            originalWidth: img.width,
            originalHeight: img.height,
            zIndex: index, // Initialize with ascending z-index
          };
        })
      );
      setImageElements(elements);
    };

    loadImages();
  }, [images]);

  const bringToFront = () => {
    if (selectedImage === null) return;

    setImageElements((prev) => {
      const maxZ = Math.max(...prev.map((el) => el.zIndex));
      return prev.map((img, index) =>
        index === selectedImage ? { ...img, zIndex: maxZ + 1 } : img
      );
    });
  };

  const sendToBack = () => {
    if (selectedImage === null) return;

    setImageElements((prev) => {
      const minZ = Math.min(...prev.map((el) => el.zIndex));
      return prev.map((img, index) =>
        index === selectedImage ? { ...img, zIndex: minZ - 1 } : img
      );
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid pattern
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 1;
    const gridSize = 50;

    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Sort images by z-index before drawing
    const sortedElements = [...imageElements].sort(
      (a, b) => a.zIndex - b.zIndex
    );

    sortedElements.forEach((element, index) => {
      const img = new Image();
      img.src = element.url;
      ctx.drawImage(img, element.x, element.y, element.width, element.height);

      const originalIndex = imageElements.indexOf(element);
      if (originalIndex === selectedImage) {
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 2;
        ctx.strokeRect(element.x, element.y, element.width, element.height);

        // Draw resize handles
        const handleSize = 8;
        const handles = [
          { x: element.x - handleSize / 2, y: element.y - handleSize / 2 },
          {
            x: element.x + element.width - handleSize / 2,
            y: element.y - handleSize / 2,
          },
          {
            x: element.x - handleSize / 2,
            y: element.y + element.height - handleSize / 2,
          },
          {
            x: element.x + element.width - handleSize / 2,
            y: element.y + element.height - handleSize / 2,
          },
        ];

        ctx.fillStyle = "#00ff00";
        handles.forEach((handle) => {
          ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
        });
      }
    });
  }, [imageElements, selectedImage]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = imageElements.length - 1; i >= 0; i--) {
      const img = imageElements[i];
      if (
        x >= img.x &&
        x <= img.x + img.width &&
        y >= img.y &&
        y <= img.y + img.height
      ) {
        setSelectedImage(i);
        setIsDragging(true);
        setDragStart({ x: x - img.x, y: y - img.y });
        break;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || selectedImage === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setImageElements((prev) =>
      prev.map((img, index) => {
        if (index === selectedImage) {
          // Keep the image within canvas bounds
          const newX = Math.max(
            0,
            Math.min(x - dragStart.x, canvas.width - img.width)
          );
          const newY = Math.max(
            0,
            Math.min(y - dragStart.y, canvas.height - img.height)
          );

          return {
            ...img,
            x: newX,
            y: newY,
          };
        }
        return img;
      })
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedOnImage = imageElements.some(
      (img) =>
        x >= img.x &&
        x <= img.x + img.width &&
        y >= img.y &&
        y <= img.y + img.height
    );

    if (!clickedOnImage) {
      setSelectedImage(null);
    }
  };

  const handleSave = () => {
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    let maxX = 0,
      maxY = 0;
    imageElements.forEach((img) => {
      const scaleFactor = img.originalWidth / img.width;
      const scaledX = img.x * scaleFactor;
      const scaledY = img.y * scaleFactor;
      maxX = Math.max(maxX, scaledX + img.originalWidth);
      maxY = Math.max(maxY, scaledY + img.originalHeight);
    });

    tempCanvas.width = maxX;
    tempCanvas.height = maxY;

    // Sort by z-index before saving
    const sortedElements = [...imageElements].sort(
      (a, b) => a.zIndex - b.zIndex
    );

    sortedElements.forEach((img) => {
      const scaleFactor = img.originalWidth / img.width;
      const scaledX = img.x * scaleFactor;
      const scaledY = img.y * scaleFactor;

      const image = new Image();
      image.src = img.url;
      ctx.drawImage(
        image,
        scaledX,
        scaledY,
        img.originalWidth,
        img.originalHeight
      );
    });

    onSave(tempCanvas);
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;

      // Prevent scrolling
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      const moveAmount = e.shiftKey ? 10 : 1; // Move 10px with shift key

      setImageElements((prev) =>
        prev.map((img, index) => {
          if (index !== selectedImage) return img;

          let newX = img.x;
          let newY = img.y;

          // Support both arrow keys and vim navigation (hjkl)
          switch (e.key.toLowerCase()) {
            case "arrowleft":
            case "h":
              newX = Math.max(0, img.x - moveAmount);
              break;
            case "arrowright":
            case "l":
              newX = Math.min(CANVAS_WIDTH - img.width, img.x + moveAmount);
              break;
            case "arrowup":
            case "k":
              newY = Math.max(0, img.y - moveAmount);
              break;
            case "arrowdown":
            case "j":
              newY = Math.min(CANVAS_HEIGHT - img.height, img.y + moveAmount);
              break;
          }

          return {
            ...img,
            x: newX,
            y: newY,
          };
        })
      );
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <button
          onClick={onReset}
          className="absolute -top-4 -right-4 bg-gray-200 dark:bg-gray-800 p-2 rounded-full z-10 hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white"
        >
          ✕
        </button>
        <div className="overflow-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
            tabIndex={0}
            className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("canvas.arrange")}
          </p>
          {selectedImage !== null && (
            <>
              <button
                onClick={bringToFront}
                className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {t("canvas.bring-front")}
              </button>
              <button
                onClick={sendToBack}
                className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {t("canvas.send-back")}
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({t("canvas.keyboard-hint")})
              </span>
            </>
          )}
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:opacity-90"
        >
          {t("canvas.save")}
        </button>
      </div>
    </div>
  );
};
