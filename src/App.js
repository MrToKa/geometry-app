// src/App.js
import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const App = () => {
  const [rectangle, setRectangle] = useState({ width: '', height: '' });
  const [spacing, setSpacing] = useState(0);
  const [diameters, setDiameters] = useState('');
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);

  const handleRectangleChange = (e) => {
    const { name, value } = e.target;
    setRectangle({ ...rectangle, [name]: value });
  };

  const handleSpacingChange = (e) => {
    setSpacing(e.target.value);
  };

  const handleDiametersChange = (e) => {
    setDiameters(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rectWidth = parseFloat(rectangle.width) * 4; // Scale up the width
    const rectHeight = parseFloat(rectangle.height) * 4; // Scale up the height
    const space = parseFloat(spacing) * 4; // Scale up the spacing
    const diametersArray = diameters.split(',').map(Number).map((d, i) => ({ value: d * 4, originalIndex: i + 1 })); // Scale up the diameters

    const circlesFit = canCirclesFit(rectWidth, rectHeight, space, diametersArray);
    setResult(circlesFit);
    drawShapes(rectWidth, rectHeight, space, diametersArray);
  };

  const canCirclesFit = (width, height, spacing, diameters) => {
    let x = spacing, y = height - spacing;
    let maxHeightInRow = 0;
    for (let i = 0; i < diameters.length; i++) {
      if (x + diameters[i].value + spacing > width) {
        x = spacing;
        y -= maxHeightInRow + spacing;
        maxHeightInRow = 0;
      }
      if (y - diameters[i].value < spacing) {
        return false;
      }
      maxHeightInRow = Math.max(maxHeightInRow, diameters[i].value);
      x += diameters[i].value + spacing;
    }
    return true;
  };

  const groupCirclesByDiameter = (diameters) => {
    const groups = {};
    diameters.forEach(d => {
      if (!groups[d.value]) {
        groups[d.value] = [];
      }
      groups[d.value].push(d);
    });
    return Object.values(groups).sort((a, b) => b[0].value - a[0].value);
  };

  const drawShapes = (width, height, spacing, diameters) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sort diameters by size for drawing
    diameters.sort((a, b) => b.value - a.value);

    // Draw rectangle
    ctx.strokeStyle = 'black';
    ctx.strokeRect(50, 50, width, height);

    const groups = groupCirclesByDiameter(diameters);

    let startX = 50 + spacing;
    let startY = 50 + height - spacing;

    for (let group of groups) {
      let diameter = group[0].value;
      let numRows = Math.min(Math.floor((height - spacing) / (diameter + spacing)), 8);
      let numCols = Math.min(Math.ceil(group.length / numRows), 12);
      let x = startX;
      let y = startY;

      let positions = [];
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
          positions.push({ x: startX + col * (diameter + spacing), y: startY - row * (diameter + spacing) });
        }
      }

      positions = positions.slice(0, group.length);
      positions.sort((a, b) => {
        if (a.y === b.y) return a.x - b.x;
        return b.y - a.y;
      });

      for (let i = 0; i < group.length; i++) {
        let { value, originalIndex } = group[i];
        let pos = positions[i];

        ctx.beginPath();
        ctx.arc(pos.x + value / 2, pos.y - value / 2, value / 2, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw the original order number inside the circle
        ctx.font = `${Math.min(value / 2, 40)}px Arial`; // Adjusted font size
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(originalIndex, pos.x + value / 2, pos.y - value / 2);
      }

      startX += numCols * (diameter + spacing);
      if (startX + diameter + spacing > 50 + width) {
        startX = 50 + spacing;
        startY -= numRows * (diameter + spacing);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 1.5; // Scale up the canvas width
    canvas.height = window.innerHeight * 1.5; // Scale up the canvas height
  }, []);

  return (
    <div className="App">
      <h1>Geometric Calculations</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Rectangle Width:</label>
          <input type="number" name="width" value={rectangle.width} onChange={handleRectangleChange} required />
        </div>
        <div>
          <label>Rectangle Height:</label>
          <input type="number" name="height" value={rectangle.height} onChange={handleRectangleChange} required />
        </div>
        <div>
          <label>Spacing Between Circles:</label>
          <input type="number" value={spacing} onChange={handleSpacingChange} />
        </div>
        <div>
          <label>Circle Diameters (comma separated):</label>
          <textarea value={diameters} onChange={handleDiametersChange} required />
        </div>
        <button type="submit">Check Fit</button>
      </form>
      {result !== null && (
        <div>
          {result ? <p>All circles can fit inside the rectangle.</p> : <p>Circles cannot fit inside the rectangle.</p>}
        </div>
      )}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default App;
