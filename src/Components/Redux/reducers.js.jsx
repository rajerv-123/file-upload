const initialState = {
  files: [],
};

const fileReducer = (state = initialState, action) => {
  switch (action.type) {
    case "UPLOAD_FILE":
      return {
        ...state,
        files: [...state.files, action.payload],
      };
    case "DELETE_FILE":
      return {
        ...state,
        files: state.files.filter((file) => file.name !== action.payload),
      };
    default:
      return state;
  }
};

export default fileReducer;
