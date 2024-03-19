export const uploadFile = (fileInfo) => ({
    type: 'UPLOAD_FILE',
    payload: fileInfo,
  });
  
  export const deleteFile = (fileName) => ({
    type: 'DELETE_FILE',
    payload: fileName,
  });
  