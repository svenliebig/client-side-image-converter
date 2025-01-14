import React, { useState, useSyncExternalStore } from "react";
import i18n from "../i18n/i18n";
import { ImageDropZone } from "./ImageDropZone";
import { ImageEditor } from "./ImageEditor";
import { rerenderStore } from "../utils/rerender-store";

export const App: React.FC = () => {
	useSyncExternalStore(rerenderStore.subscribe, rerenderStore.getSnapshot);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleImageAccepted = (file: File) => {
		setSelectedFile(file);
	};

	const handleReset = () => {
		setSelectedFile(null);
	};

	return (
		<div className="container mx-auto px-4 py-16">
			<h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">{i18n.t("app.name")}</h1>
			{selectedFile ? (
				<ImageEditor imageFile={selectedFile} onReset={handleReset} />
			) : (
				<ImageDropZone onImageAccepted={handleImageAccepted} />
			)}
		</div>
	);
};
