import React, { useState, useEffect } from "react";
import "./Upload.css";
import { FiUploadCloud, FiVideo } from "react-icons/fi";
import Compressor from "compressorjs";
import Messages from "../Popups/Messages";
import { Progress, Modal } from "antd";
import { connect } from "react-redux";
import { uploadFile } from "../Redux/actions";
import { saveAs } from "file-saver";

const UploadFileImageAndVideo = ({ uploadFile }) => {
  const [uploadType, setUploadType] = useState("image");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [uploadDisabled, setUploadDisabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isUploaded, setIsUploaded] = useState(false);

  const handleRadioChange = (event) => {
    setUploadType(event.target.value);
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadDisabled(false);
    setErrorMessage("");
    setSuccessMessage("");
    setModalVisible(false);
    setIsUploaded(false);
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
        uploadStatus: true,
      };
      uploadFile(fileInfo);
  
      setSuccessMessage("File uploaded successfully.");
      setIsUploaded(true);
  
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } else {
      console.log("File size exceeds the limit. Compressing...");
      setCompressing(true);
      setProgressPercent(0);
  
      console.log("Compressing file...");
      try {
        let compressedFile;
        if (uploadType === "image") {
          compressedFile = await compressFile(selectedFile);
        } else if (uploadType === "video") {
          compressedFile = await compressVideo(selectedFile);
        }
  
        const compressedFileSize = compressedFile.size / (1024 * 1024);
        console.log(
          "Compressed file size:",
          compressedFileSize.toFixed(2),
          "MB"
        );
  
        if (compressedFileSize === fileSize) {
          setErrorMessage(
            "Compression did not reduce the file size. Please try again with a different file."
          );
          setSuccessMessage("");
          setIsUploaded(false); // Disable download
        } else if (compressedFileSize > maxSize) {
          setErrorMessage(
            `We could not reduce the file size to the expected value. Please try to upload the file with a size less than or equal to ${maxSize} MB.`
          );
          setSuccessMessage("");
          setIsUploaded(false); // Disable download
        } else {
          setSuccessMessage(
            uploadType === "image"
              ? "Image compression successful."
              : "Video compression successful."
          );
  
          // Dispatch action to store file information in Redux
          const fileInfo = {
            name: selectedFile.name,
            size: compressedFileSize.toFixed(2) + " MB",
            type: selectedFile.type,
            uploadStatus: true,
          };
          uploadFile(fileInfo);
  
          // Compare file sizes before saving
          const originalSize = fileSize;
          if (originalSize !== compressedFileSize) {
            // Download the compressed file
            saveCompressedFile(compressedFile, uploadType);
            setIsUploaded(true);
          } else {
            setErrorMessage(
              "Compression did not reduce the file size. Please try again with a different file."
            );
            setIsUploaded(false); // Disable download
          }
  
          setTimeout(() => {
            setSuccessMessage("");
          }, 4000);
        }
      } catch (error) {
        console.error("Error compressing file:", error);
        setErrorMessage("Error compressing file. Please try again.");
        setSuccessMessage(""); // Clear success message
        setIsUploaded(false); // Disable download
        saveOriginalFile(selectedFile, uploadType);
      } finally {
        setCompressing(false);
        setProgressPercent(100);
        setSelectedFile(null);
  
        const fileInput = document.getElementById("file-upload");
        if (fileInput) {
          fileInput.value = "";
        }
      }
    }
  };
  


  const compressFile = async (file) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        new Compressor(file, {
          quality: 0.6,
          success(compressedFile) {
            resolve(compressedFile);
          },
          error(err) {
            reject(err);
          },
          progress(percent) {
            setProgressPercent(percent);
          },
        });
      }, 4000);
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

  const saveOriginalFile = (file, type) => {
    const savePath = type === "image" ? "C:\\X_File_Image" : "C:\\Y_File_Video";
    const fileName = file.name.includes(".")
      ? file.name
      : `${file.name}.${getFileExtension(file.type)}`;
    const reader = new FileReader();
    reader.onload = function (event) {
      const blob = new Blob([new Uint8Array(event.target.result)]);
      saveAs(blob, `${savePath}\\${fileName}`);
    };
    reader.readAsArrayBuffer(file);
  };

  const saveCompressedFile = (file, type) => {
    const savePath =
      type === "image" ? "C:\\X_COMPRESS_IMAGE" : "C:\\Y_COMPRESS_VIDEO";
    const fileName = file.name.includes(".")
      ? file.name
      : `${file.name}.${getFileExtension(file.type)}`;
    saveAs(file, `${savePath}\\${fileName}`);
  };

  const getFileExtension = (fileType) => {
    return fileType.split("/").pop();
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setErrorMessage("");
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [errorMessage, successMessage]);

  const progressStatus =
    progressPercent === 100 ? "success" : compressing ? "active" : "";

  return (
    <div className="upload-container">
      <div className="centered-container">
        <Modal
          title="Error"
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <p style={{ color: "red" }}>{modalMessage}</p>
        </Modal>
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
            <h2>File Upload</h2>
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
                value={null}
              />
              <button onClick={handleUpload} disabled={uploadDisabled}>
                Upload File
              </button>
            </div>
            {compressing && (
              <Progress
                percent={progressPercent}
                status={progressStatus}
                strokeLinecap="square"
                showInfo={false}
              />
            )}
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
