import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Start } from "@/pages/Start";
import { Game } from "@/pages/Game";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}
