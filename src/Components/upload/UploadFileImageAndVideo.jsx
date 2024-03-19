import React, { useState, useEffect } from "react";
import "./Upload.css";
import { FiUploadCloud, FiVideo } from "react-icons/fi";
import Compressor from "compressorjs";
import Messages from "../Popups/Messages";
import { Progress } from "antd";
import { Flex } from "antd";
import { connect } from "react-redux";
import { uploadFile } from "../Redux/actions";

const UploadFileImageAndVideo = ({ uploadFile }) => {
  const [uploadType, setUploadType] = useState("image");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [compressing, setCompressing] = useState(false);

  const handleRadioChange = (event) => {
    setUploadType(event.target.value);
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const fileSize = selectedFile.size / (1024 * 1024);
    const maxSize = uploadType === "image" ? 2 : 6;

    if (fileSize <= maxSize) {
      console.log("File size:", fileSize.toFixed(2), "MB");
      setErrorMessage("");

      const fileInfo = {
        name: selectedFile.name,
        size: fileSize.toFixed(2) + " MB",
        type: selectedFile.type,
      };

      // here I am Dispatch action to store file information in Redux
      uploadFile(fileInfo);

      setSuccessMessage("File uploaded successfully."); 

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } else {
      console.log("File size exceeds the limit. Compressing...");
      setErrorMessage(""); // Clear any previous error messages

      setCompressing(true); // Set compressing state to true

      console.log("Compressing file...");
      try {
        if (uploadType === "image") {
          const compressedFile = await compressFile(selectedFile);
          const compressedFileSize = compressedFile.size / (1024 * 1024);
          console.log(
            "Compressed file size:",
            compressedFileSize.toFixed(2),
            "MB"
          );
          setSuccessMessage("Image compression successful.");
        } else if (uploadType === "video") {
          const compressedVideo = await compressVideo(selectedFile);
          const compressedVideoSize = compressedVideo.size / (1024 * 1024);
          console.log(
            "Compressed video size:",
            compressedVideoSize.toFixed(2),
            "MB"
          );
          setSuccessMessage("Video compression successful.");
        }
      } catch (error) {
        console.error("Error compressing file:", error);
        setErrorMessage("Error compressing file. Please try again.");
      } finally {
        setCompressing(false); // Set compressing state to false after compression
      }
    }
  };

  const compressFile = async (file) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.6,
        success(compressedFile) {
          resolve(compressedFile);
        },
        error(err) {
          reject(err);
        },
        progress(percent) {
          setProgressPercent(percent); // here i am updating the state
        },
      });
    });
  };

  const compressVideo = async (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "video/mp4",
          0.6
        );
      };

      video.onerror = (error) => {
        reject(error);
      };

      video.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setProgressPercent(percent);
        }
      };

      video.src = URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setErrorMessage("");
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [errorMessage, successMessage]);

  return (
    <div className="upload-main-div">
      {compressing && (
        <div className="upload-loading-overlay">
          <Flex gap="small" wrap="wrap">
            <Progress type="circle" percent={progressPercent} />
          </Flex>
        </div>
      )}
      <div>
        <div className="notification">
          {errorMessage && (
            <Messages messageType="error" message={errorMessage} />
          )}
          {successMessage && (
            <Messages messageType="success" message={successMessage} />
          )}
        </div>

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
            <input
              type="file"
              id="file-upload"
              accept={uploadType === "image" ? "image/*" : "video/*"}
              onChange={handleFileSelect}
            />
            <button onClick={handleUpload}>Upload File</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapDispatchToProps = {
  uploadFile,
};

export default connect(null, mapDispatchToProps)(UploadFileImageAndVideo);