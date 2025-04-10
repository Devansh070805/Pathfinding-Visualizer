// import React from "react";
// import Grid from "./components/Grid";

// function App() {
//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>Pathfinding Visualizer</h1>
//       <Grid gridSize={20} />
//     </div>
//   );
// }

// export default App;

import React, { useState } from "react";
import D3Grid from "./components/D3Grid";
import GraphVisualizer from "./components/GraphVisualizer";
import './App.css';  

const App = () => {
  const [mode, setMode] = useState("grid");

  return (
    <div>
      <h1 className="header">Pathfinding Visualizer</h1>
      <div className="controls">
        <button onClick={() => setMode("grid")}>Grid View</button>
        <button onClick={() => setMode("graph")}>Graph View</button>
      </div>
      {mode === "grid" ? <D3Grid /> : <GraphVisualizer />}
    </div>
  );
};

export default App;


