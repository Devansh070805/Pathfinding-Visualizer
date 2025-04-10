import React, { useState } from "react";
import "./Grid.css";
import axios from "axios";

const Grid = ({ gridSize = 20 }) => {
  const [grid, setGrid] = useState(() =>
    Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill("empty"))
  );

  const [mode, setMode] = useState("start");
  const [startPos, setStartPos] = useState(null);
  const [endPos, setEndPos] = useState(null);
  const [visited, setVisited] = useState([]);
  const [path, setPath] = useState([]);
  const [algorithm, setAlgorithm] = useState("bfs");

  const handleCellClick = (row, col) => {
    const newGrid = grid.map((r) => [...r]);

    if (mode === "start" && !startPos) {
      newGrid[row][col] = "start";
      setStartPos([row, col]);
    } else if (mode === "end" && !endPos) {
      newGrid[row][col] = "end";
      setEndPos([row, col]);
    } else if (mode === "wall") {
      newGrid[row][col] =
        newGrid[row][col] === "wall" ? "empty" : "wall";
    }

    setGrid(newGrid);
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const animatePath = async (visitedNodes, shortestPath) => {
    for (let i = 0; i < visitedNodes.length; i++) {
      const [row, col] = visitedNodes[i];
      await sleep(10);
      setVisited((prev) => [...prev, [row, col]]);
    }

    for (let i = 0; i < shortestPath.length; i++) {
      const [row, col] = shortestPath[i];
      await sleep(30);
      setPath((prev) => [...prev, [row, col]]);
    }
  };

  const runPathfinding = async () => {
    const walls = [];
    grid.forEach((row, i) =>
      row.forEach((cell, j) => {
        if (cell === "wall") walls.push([i, j]);
      })
    );

    if (!startPos || !endPos) {
      alert("Please set both start and end points.");
      return;
    }

    try {
      console.log("Sending to Backend: ", algorithm);
      const res = await axios.post("http://127.0.0.1:8002/pathfind", {
        grid_size: gridSize,
        start: startPos,
        end: endPos,
        walls: walls,
        algorithm: algorithm,
      }
    );

      setVisited([]);
      setPath([]);
      await animatePath(res.data.visited, res.data.path);
    } catch (err) {
      console.error(err);
      alert("Error fetching path. Check backend.");
    }
  };

  const getClassName = (row, col) => {
    const type = grid[row][col];
    if (path.some(([r, c]) => r === row && c === col)) return "path";
    if (visited.some(([r, c]) => r === row && c === col)) return "visited";
    return type;
  };

  const resetPath = () => {
    setVisited([]);
    setPath([]);
  };

  const clearAll = () => {
    const clearedGrid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => "empty")
    );
    setStartPos(null);
    setEndPos(null);
    setVisited([]);
    setPath([]);
    setGrid(clearedGrid);
  };

  return (
    <div>
      <div className="controls">
        <button onClick={() => setMode("start")}>Set Start</button>
        <button onClick={() => setMode("end")}>Set End</button>
        <button onClick={() => setMode("wall")}>Toggle Walls</button>
        <button onClick={runPathfinding}>Run Pathfinding</button>
        <button onClick={resetPath}>Reset Path</button>
        <button onClick={clearAll}>Clear All</button>

        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          className="dropdown"
        >
          <option value="bfs">Breadth First Search</option>
          <option value="dfs">Depth First Search</option>
          <option value="dijkstra">Dijkstra's Algorithm</option>
          <option value="astar">A* Search</option>
        </select>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 25px)` }}
      >
        {grid.map((row, rowIndex) =>
          row.map((_, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${getClassName(rowIndex, colIndex)}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Grid;