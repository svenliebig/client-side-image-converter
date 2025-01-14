import React, { useState } from 'react';
import { ImageDropZone } from './ImageDropZone';
import { ImageEditor } from './ImageEditor';

export const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageAccepted = (file: File) => {
    setSelectedFile(file);
  };

  const handleReset = () => {
    setSelectedFile(null);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Image Converter
      </h1>
      {selectedFile ? (
        <ImageEditor imageFile={selectedFile} onReset={handleReset} />
      ) : (
        <ImageDropZone onImageAccepted={handleImageAccepted} />
      )}
    </div>
  );
};