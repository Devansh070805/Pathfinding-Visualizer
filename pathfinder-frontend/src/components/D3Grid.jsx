import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./Grid.css";
import axios from "axios";

const D3Grid = ({ gridSize = 20 }) => {
  const svgRef = useRef();
  const [mode, setMode] = useState("start");
  const [startPos, setStartPos] = useState(null);
  const [endPos, setEndPos] = useState(null);
  const [algorithm, setAlgorithm] = useState("bfs");
  const [gridData, setGridData] = useState(() =>
    Array(gridSize).fill(null).map(() => Array(gridSize).fill("empty"))
  );

  useEffect(() => {
    const cellSize = 25;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", gridSize * cellSize)
      .attr("height", gridSize * cellSize)
      .style("border", "1px solid #ccc");

    svg
      .selectAll("rect")
      .data(
        gridData.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => ({
            row: rowIndex,
            col: colIndex,
            status: cell,
          }))
        )
      )
      .enter()
      .append("rect")
      .attr("x", (d) => d.col * cellSize)
      .attr("y", (d) => d.row * cellSize)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", (d) => getColor(d.status))
      .attr("stroke", "#ccc")
      .on("click", function (event, d) {
        const newGrid = gridData.map((row) => [...row]);

        if (mode === "start") {
          clearValue(newGrid, "start");
          newGrid[d.row][d.col] = "start";
          setStartPos([d.row, d.col]);
        } else if (mode === "end") {
          clearValue(newGrid, "end");
          newGrid[d.row][d.col] = "end";
          setEndPos([d.row, d.col]);
        } else if (mode === "wall") {
          newGrid[d.row][d.col] =
            newGrid[d.row][d.col] === "wall" ? "empty" : "wall";
        }

        setGridData(newGrid);
      });

    function clearValue(grid, value) {
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
          if (grid[i][j] === value) grid[i][j] = "empty";
        }
      }
    }

    function getColor(type) {
      switch (type) {
        case "start":
          return "green";
        case "end":
          return "red";
        case "wall":
          return "black";
        default:
          return "white";
      }
    }
  }, [gridData, mode, gridSize]);

  const runPathfinding = async () => {
    if (!startPos || !endPos) {
      alert("Please set both start and end points.");
      return;
    }

    const walls = [];
    gridData.forEach((row, i) =>
      row.forEach((cell, j) => {
        if (cell === "wall") walls.push([i, j]);
      })
    );

    try {
      const res = await axios.post("http://127.0.0.1:8002/pathfind", {
        grid_size: gridSize,
        start: startPos,
        end: endPos,
        walls: walls,
        algorithm: algorithm,
      });

      animatePath(res.data.visited, res.data.path);
    } catch (err) {
      console.error("Backend error:", err);
      alert("Error communicating with backend.");
    }
  };

  const animatePath = async (visitedNodes, shortestPath) => {
    const cellSize = 25;
    const svg = d3.select(svgRef.current);

    for (const [r, c] of visitedNodes) {
      svg
        .append("rect")
        .attr("x", c * cellSize)
        .attr("y", r * cellSize)
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("fill", "#87ceeb")
        .attr("stroke", "#ccc");

      await new Promise((res) => setTimeout(res, 10));
    }

    for (const [r, c] of shortestPath) {
      svg
        .append("rect")
        .attr("x", c * cellSize)
        .attr("y", r * cellSize)
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("fill", "#32cd32")
        .attr("stroke", "#ccc");

      await new Promise((res) => setTimeout(res, 25));
    }
  };

  const resetPath = () => {
    setGridData((prev) =>
      prev.map((row) =>
        row.map((cell) =>
          cell === "visited" || cell === "path" ? "empty" : cell
        )
      )
    );
  };

  const clearAll = () => {
    setGridData(
      Array(gridSize).fill(null).map(() => Array(gridSize).fill("empty"))
    );
    setStartPos(null);
    setEndPos(null);
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
          <option value="bfs">BFS</option>
          <option value="dfs">DFS</option>
          <option value="dijkstra">Dijkstra</option>
          <option value="astar">A*</option>
        </select>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default D3Grid;
