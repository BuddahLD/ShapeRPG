import React, { useEffect } from "react";
import Game from "./components/Game";
import { UILayoutManager } from "./presentation/managers/UILayoutManager";

function App() {
  // Initialize layout manager immediately
  useEffect(() => {
    UILayoutManager.getInstance();
  }, []);

  return (
    <div className="app-container">
      <Game />
    </div>
  );
}

export default App;
