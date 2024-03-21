import React, { useState, useEffect } from "react";
import "./Upload.css";
import Compressor from "compressorjs";
import { Progress, Modal, Radio } from "antd";
import { connect } from "react-redux";
import { uploadFile } from "../Redux/actions";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

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

  const handleFileSelect = (info) => {
    const { file } = info;
    if (file && file.originFileObj) {
      setSelectedFile(file.originFileObj);
      setUploadDisabled(false);
      setErrorMessage("");
      setSuccessMessage("");
      setModalVisible(false);
      setIsUploaded(false);
    }
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

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", uploadType);

      try {
        const response = await fetch("http://localhost:3001/upload/original", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setProgressPercent(100);
          setSuccessMessage("File uploaded successfully.");
          setIsUploaded(true);

          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        } else {
          setErrorMessage("Error uploading file. Please try again.");
          setIsUploaded(false);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        setErrorMessage("Error uploading file. Please try again.");
        setIsUploaded(false);
      }
    } else {
      setCompressing(true);
      setProgressPercent(0);

      console.log("File size exceeds the limit. Compressing...");
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
          setIsUploaded(false);
        } else if (compressedFileSize > maxSize) {
          setErrorMessage(
            `We could not reduce the file size to the expected value. Please try to upload the file with a size less than or equal to ${maxSize} MB.`
          );
          setSuccessMessage("");
          setIsUploaded(false);
        } else {
          setSuccessMessage(
            uploadType === "image"
              ? "Image compression successful."
              : "Video compression successful."
          );
          const fileInfo = {
            name: selectedFile.name,
            size: compressedFileSize.toFixed(2) + " MB",
            type: selectedFile.type,
            uploadStatus: true,
          };
          uploadFile(fileInfo);
          const originalSize = fileSize;
          if (originalSize !== compressedFileSize) {
            saveCompressedFile(compressedFile, uploadType);
            setIsUploaded(true);
          } else {
            setErrorMessage(
              "Compression did not reduce the file size. Please try again with a different file."
            );
            setIsUploaded(false);
          }

          setTimeout(() => {
            setSuccessMessage("");
          }, 4000);
        }
      } catch (error) {
        console.error("Error compressing file:", error);
        setErrorMessage("Error compressing file. Please try again.");
        setSuccessMessage("");
        setIsUploaded(false);
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
    return new Promise(async (resolve, reject) => {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 6) {
        try {
          const compressedFile = await new Promise((resolve, reject) => {
            new Compressor(file, {
              quality: 0.6,
              success(compressedFile) {
                resolve(compressedFile);
              },
              error(err) {
                reject(err);
              },
              progress(percent) {},
            });
          });
          resolve(compressedFile);
        } catch (error) {
          reject(error);
        }
      } else {
        resolve(file);
      }
    });
  };

  const compressVideo = async (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const reader = new FileReader();

      reader.onload = function (event) {
        video.src = event.target.result;

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            file.type,
            0.6
          );
        };

        video.onerror = (error) => {
          reject(error);
        };
      };

      reader.readAsDataURL(file);
    });
  };

  function saveOriginalFile(file, type) {
    let savePath = "";
    if (type === "image") {
      savePath = "C:/X_File_Image";
    } else if (type === "video") {
      savePath = "C:/Y_File_Video";
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    fetch("http://localhost:3001/upload/original", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
      })
      .catch((error) => {
        console.error("Error saving original file:", error);
      });
  }

  const saveCompressedFile = (file, type) => {
    if (!file || !file.name) {
      console.error("Invalid file object:", file);
      return;
    }

    const savePath = `http://localhost:3001/upload/${type}`;
    const fileName = file.name.includes(".")
      ? file.name
      : `${file.name}.${getFileExtension(file.type)}`;
    const formData = new FormData();
    formData.append("file", file, fileName);

    // Send a POST request to your server to save the file
    fetch(savePath, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          console.log("File saved successfully:", response);
        } else {
          console.error("Error saving file:", response);
        }
      })
      .catch((error) => {
        console.error("Error saving file:", error);
      });
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
      {compressing && (
        <div className="loader-overlay">
          <div className="progress-container">
            <p className="progress-text">Compressing...</p>
            <Progress
              type="circle"
              percent={progressPercent}
              size={80}
              format={() => null}
            />
          </div>
        </div>
      )}
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
              <div className="error-message">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
          </div>

          <div className="upload-content">
            <h2
              style={{ fontFamily: "Arial", fontSize: "24px", color: "#333" }}
            >
              File Upload
            </h2>{" "}
            {/* Modified */}
            <div className="upload-options">
              <label className={` ${uploadType === "image" ? "selected" : ""}`}>
                <Radio
                  type="radio"
                  value="image"
                  checked={uploadType === "image"}
                  onChange={handleRadioChange}
                  style={{ fontWeight: "500" }}
                >
                  Image
                </Radio>
              </label>
              <label className={` ${uploadType === "video" ? "selected" : ""}`}>
                <Radio
                  type="radio"
                  value="video"
                  checked={uploadType === "video"}
                  onChange={handleRadioChange}
                  style={{ fontWeight: "500" }}
                >
                  Video
                </Radio>
              </label>
            </div>
            <div
              className="file-upload"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <div className="file-upload">
                <Upload
                  accept={uploadType === "image" ? "image/*" : "video/*"}
                  fileList={[]}
                  onChange={handleFileSelect}
                  value={null}
                >
                  <Button icon={<UploadOutlined />}>Upload File</Button>
                </Upload>
              </div>
              {selectedFile && (
                <div
                  style={{
                    fontSize: "16px",
                    marginTop: "20px",
                    textAlign: "center",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "5px",
                    padding: "10px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <p style={{ marginBottom: "5px" }}>Selected File:</p>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#007bff",
                      marginTop: "5px",
                    }}
                  >
                    {selectedFile.name}
                  </p>
                </div>
              )}

              <br />

              <Button
                type="primary"
                onClick={handleUpload}
                disabled={uploadDisabled}
              >
                Upload File
              </Button>
            </div>
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
