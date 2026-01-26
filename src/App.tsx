import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatInterface from "./ChatInterface";
import Login from "./Login";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<ChatInterface />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
