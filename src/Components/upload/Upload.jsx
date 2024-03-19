import React, { useState } from "react";
import "./Upload.css";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../header/Header";
import { FiUploadCloud, FiVideo } from "react-icons/fi";
import Compressor from "compressorjs";
// Import compress function from compressorjs library

const Upload = () => {
  const [uploadType, setUploadType] = useState("image");

  const handleRadioChange = (event) => {
    setUploadType(event.target.value);
  };

  // Function to handle file upload
// Function to handle file upload
const handleFileUpload = async (event) => {
  const file = event.target.files[0]; // Get the uploaded file
  const fileSize = file.size / (1024 * 1024); // Convert file size to MB
  const maxSize = uploadType === "image" ? 2 : 6; // Maximum allowed size

  if (fileSize <= maxSize) {
    // If file size is within the allowed limit
    console.log("File size:", fileSize.toFixed(2), "MB");
  } else {
    // If file size exceeds the allowed limit, compress the file
    console.log("File size exceeds the limit. Compressing...");
    if (uploadType === "image") {
      const compressedFile = await compressFile(file);
      const compressedFileSize = compressedFile.size / (1024 * 1024); // Convert compressed file size to MB
      console.log("Compressed file size:", compressedFileSize.toFixed(2), "MB");
    } else if (uploadType === "video") {
      const compressedVideo = await compressVideo(file);
      const compressedVideoSize = compressedVideo.size / (1024 * 1024); // Convert compressed video size to MB
      console.log("Compressed video size:", compressedVideoSize.toFixed(2), "MB");
    }
  }
};


  // Function to compress the file
  const compressFile = async (file) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.6, // Adjust the quality of compression as needed
        success(compressedFile) {
          resolve(compressedFile);
        },
        error(err) {
          reject(err);
        },
      });
    });
  };

  const compressVideo = async (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'video/mp4', 0.6); // Adjust quality as needed
      };
  
      video.onerror = (error) => {
        reject(error);
      };
  
      video.src = URL.createObjectURL(file);
    });
  };
  

  return (
    <div className="upload-main-div">
      <div className="upload-container">
        <h2>Choose Your Upload Type</h2>
        <div className="upload-options">
          <label className="radio-label">
            <input
              type="radio"
              value="image"
              checked={uploadType === "image"}
              onChange={handleRadioChange}
            />
            <FiUploadCloud className="upload-icon" />
            <span className="upload-text">Image</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="video"
              checked={uploadType === "video"}
              onChange={handleRadioChange}
            />
            <FiVideo className="upload-icon" />
            <span className="upload-text">Video</span>
          </label>
        </div>
        <div className="file-upload">
          {uploadType === "image" && (
            <div className="image-upload-option">
              <br />
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleFileUpload} // Call handleFileUpload on file selection
              />
            </div>
          )}
          {uploadType === "video" && (
            <div className="video-upload-option">
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                onChange={handleFileUpload} // Call handleFileUpload on file selection
              />
            </div>
          )}
        </div>
        <button className="upload-button">Upload File</button>
      </div>
    </div>
  );
};

export default Upload;
