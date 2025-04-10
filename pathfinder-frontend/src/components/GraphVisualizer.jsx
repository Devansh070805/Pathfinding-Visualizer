import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import axios from "axios";
import "./Grid.css";

const GraphVisualizer = () => {
  const svgRef = useRef();
  const [nodes] = useState([
    { id: "A" },
    { id: "B" },
    { id: "C" },
    { id: "D" },
    { id: "E" },
    { id: "F" }
  ]);
  const [edges] = useState([
    { source: "A", target: "B" },
    { source: "A", target: "C" },
    { source: "B", target: "D" },
    { source: "C", target: "D" },
    { source: "D", target: "E" },
    { source: "E", target: "F" }
  ]);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [algorithm, setAlgorithm] = useState("bfs");

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 500;
    const height = 400;

    // Centering the force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2)) // Center force in the SVG container
      .force("link", d3.forceLink(edges).id(d => d.id).distance(100))
      .on("tick", ticked);

    const link = svg
      .append("g")
      .selectAll("line")
      .data(edges)
      .enter()
      .append("line")
      .attr("stroke", "#aaa");

    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 20)
      .attr("fill", d => getColor(d))
      .on("click", (event, d) => {
        if (!start) setStart(d);
        else if (!end) setEnd(d);
      })
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    const label = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text(d => d.id)
      .attr("font-size", "12px")
      .attr("dy", 4)
      .attr("text-anchor", "middle");

    function ticked() {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("fill", d => getColor(d));

      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    }

    function getColor(d) {
      if (d === start) return "green";
      if (d === end) return "red";
      return "#69b3a2";
    }

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => simulation.stop();
  }, [start, end]);

  const runPathfinding = async () => {
    if (!start || !end) {
      alert("Please select both start and end nodes.");
      return;
    }
  
    try {
      // Send only the node ids as strings
      const nodeIds = nodes.map(node => node.id);  // Extract ids of nodes
  
      // Send the edges as arrays of node ids
      const edgeList = edges.map(edge => [edge.source.id, edge.target.id]); // Source and target node ids
  
      // Extract start and end node ids as strings
      const startNodeId = start.id;
      const endNodeId = end.id;
  
      const res = await axios.post("http://127.0.0.1:8002/graphfind", {
        nodes: nodeIds,
        edges: edgeList,
        start: startNodeId,
        end: endNodeId,
        algorithm
      });
  
      animatePath(res.data.visited, res.data.path);
    } catch (err) {
      console.error("Error communicating with backend:", err.response?.data || err.message);
      alert("Error communicating with backend.");
    }
  };
  

  const animatePath = async (visited, path) => {
    const svg = d3.select(svgRef.current);

    for (const nodeId of visited) {
      svg.selectAll("circle")
        .filter(d => d.id === nodeId)
        .transition()
        .duration(200)
        .attr("fill", "#add8e6"); // light blue
      await new Promise(res => setTimeout(res, 200));
    }

    for (const nodeId of path) {
      svg.selectAll("circle")
        .filter(d => d.id === nodeId)
        .transition()
        .duration(300)
        .attr("fill", "#32cd32"); // lime green
      await new Promise(res => setTimeout(res, 300));
    }
  };

  const resetGraph = () => {
    setStart(null);
    setEnd(null);
  };

  return (
    <div>
      <div className="controls">
        <button onClick={resetGraph}>Reset</button>
        <button onClick={runPathfinding}>Run Pathfinding</button>
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
      <div className="graph-container">
        <svg ref={svgRef} width={600} height={400}></svg>
      </div>
    </div>
  );
};

export default GraphVisualizer;
