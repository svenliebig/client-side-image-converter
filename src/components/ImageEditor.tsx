import imageCompression from "browser-image-compression";
import "cropperjs/dist/cropper.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-cropper";

interface Props {
	imageFile: File;
	onReset: () => void;
}

export const ImageEditor: React.FC<Props> = ({ imageFile, onReset }) => {
	const cropperRef = useRef<HTMLImageElement & { cropper: Cropper }>(null);
	const [resolution, setResolution] = useState({ width: 0, height: 0 });
	const [selectedScale, setSelectedScale] = useState(1);
	const [loading, setLoading] = useState(false);

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
					const compressedFile = await imageCompression(new File([blob], "", { type: blob.type }), {
						// maxSizeMB: 1,
						maxWidthOrHeight: resolution.width,
					});
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
			a.download = `converted-image.${format.split("/")[1]}`;
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
						Download as ({resolution.width} x {resolution.height}px)
					</h3>
					<div className="flex gap-4">
						{["image/png", "image/jpeg", "image/webp", "image/svg+xml"].map((format) => (
							<button
								key={format}
								onClick={() => handleDownload(format)}
								disabled={loading}
								className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:opacity-90 disabled:opacity-50"
							>
								{format.split("/")[1].toUpperCase()}
							</button>
						))}
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-lg font-semibold dark:text-white">Resolution</h3>
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
		</div>
	);
};
