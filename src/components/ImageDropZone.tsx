import React, { useRef, useState } from "react";
import type { DragEvent } from "react";

interface Props {
	onImageAccepted: (file: File) => void;
}

const ACCEPTED_TYPES = ["image/svg+xml", "image/png", "image/jpeg", "image/jpg"];

export const ImageDropZone: React.FC<Props> = ({ onImageAccepted }) => {
	const [isDragging, setIsDragging] = useState(false);
	const [isError, setIsError] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const file = e.dataTransfer.files[0];
		if (file && ACCEPTED_TYPES.includes(file.type)) {
			setIsSuccess(true);
			setIsError(false);
			onImageAccepted(file);
			setTimeout(() => setIsSuccess(false), 2000);
		} else {
			setIsError(true);
			setIsSuccess(false);
			setTimeout(() => setIsError(false), 2000);
		}
	};

	return (
		<div
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className={`w-full h-96 border-4 border-dashed rounded-xl transition-all duration-300 flex items-center justify-center
        ${isDragging ? "scale-105" : ""}
        ${isError ? "border-red-500" : ""}
        ${isSuccess ? "border-primary-light dark:border-primary-dark" : ""}
        ${!isDragging && !isError && !isSuccess ? "border-gray-300 dark:border-gray-700" : ""}
      `}
		>
			{isError ? (
				<div className="text-center">
					<div className="text-6xl mb-4">😢</div>
					<div className="text-red-500">Filetype not supported (yet)</div>
				</div>
			) : isSuccess ? (
				<div className="text-center">
					<div className="text-6xl mb-4">✅</div>
					<div className="text-primary-light dark:text-primary-dark">Processing image...</div>
				</div>
			) : (
				<div className="text-center text-gray-500 dark:text-gray-400">
					<p className="text-lg">Drop your image here</p>
					<p className="text-sm">Supported formats: SVG, PNG, JPEG</p>
				</div>
			)}
		</div>
	);
};