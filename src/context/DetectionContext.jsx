import React, { createContext, useContext, useState } from 'react';

const DetectionContext = createContext(null);

export const DetectionProvider = ({ children }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [saveResult, setSaveResult] = useState(true);
  const [sendToTelegram, setSendToTelegram] = useState(true);

  // You can also add a function to clear the state if needed
  const clearDetectionState = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    // keep user preferences like saveResult and sendToTelegram
  };

  return (
    <DetectionContext.Provider value={{
      selectedImage, setSelectedImage,
      selectedFile, setSelectedFile,
      isAnalyzing, setIsAnalyzing,
      result, setResult,
      saveResult, setSaveResult,
      sendToTelegram, setSendToTelegram,
      clearDetectionState
    }}>
      {children}
    </DetectionContext.Provider>
  );
};

export const useDetection = () => useContext(DetectionContext);
