import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./pages/home/Homes.jsx";
import List from "./pages/list/List.jsx";
import Hotel from "./pages/hotel/Hotel.jsx";
import Login from "./login/Login.jsx";
import Mumbai from "./components/mumbai/Mumbai.jsx";
import Delhi from "./components/delhi/Delhi.jsx";
import Bengaluru from "./components/bengaluru/Bengaluru.jsx";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import "./app.css";

function App() {
  const { user } = useContext(AuthContext);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/hotels" element={<List/>}/>
        <Route path="/hotels/:id" element={<Hotel/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/mumbai" element={<Mumbai/>}/>
        <Route path="/delhi" element={<Delhi/>}/>
        <Route path="/bengaluru" element={<Bengaluru/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
