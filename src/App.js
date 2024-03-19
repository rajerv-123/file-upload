import React from "react";
import "./App.css";
import Route from "./AllRoute";
import { Provider } from "react-redux";
import store from "./Components/Redux/store";

function App() {
  return (
    <Provider store={store}>
      <div>
        <Route />
      </div>
    </Provider>
  );
}

export default App;
