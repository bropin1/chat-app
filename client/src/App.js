import { Fragment } from "react";
import "./App.scss";
import Authentication from "./pages/authentication/Authentication.jsx";
import NoMatch from "./pages/noMatch/NoMatch.jsx";
import Home from "./pages/home/Home.jsx";
import { Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/:sign" element={<Authentication />} />
      <Route path="*" element={<NoMatch />} status={404} />
    </Routes>
  );
}

export default App;
