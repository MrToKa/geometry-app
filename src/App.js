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

    // Parse the new input format
    const rows = diameters.split('\n');
    const groupedData = {};

    let rowNum = 1;

    rows.forEach(row => {
        const parts = row.split(' => ');
        if (parts.length !== 5) return;

        const groupKey = parts[1];
        const diameter = parseFloat(parts[2]) * 4; // Scale up the diameter
        const side = parts[4] === 'true' ? 'right' : 'left';

        if (!groupedData[groupKey]) {
            groupedData[groupKey] = { side, circles: [] };
        }
        groupedData[groupKey].circles.push({ diameter, originalIndex: rowNum });
        rowNum++;
    });

    const groups = Object.values(groupedData);
    const circlesFit = canCirclesFit(rectWidth, rectHeight, space, groups);
    setResult(circlesFit);
    drawShapes(rectWidth, rectHeight, space, groups);
};


const canCirclesFit = (width, height, spacing, groups) => {
  for (const group of groups) {
      let { circles } = group;
      circles.sort((a, b) => b.diameter - a.diameter);

      let x = spacing, y = height - spacing;
      let maxHeightInRow = 0;
      for (let i = 0; i < circles.length; i++) {
          if (x + circles[i].diameter + spacing > width) {
              x = spacing;
              y -= maxHeightInRow + spacing;
              maxHeightInRow = 0;
          }
          if (y - circles[i].diameter < spacing) {
              return false;
          }
          maxHeightInRow = Math.max(maxHeightInRow, circles[i].diameter);
          x += circles[i].diameter + spacing;
      }
  }
  return true;
};

const drawShapes = (width, height, spacing, groups) => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw rectangle
  ctx.strokeStyle = 'black';
  ctx.strokeRect(50, 50, width, height);

  // Sort groups by the largest diameter in each group
  groups.sort((a, b) => b.circles[0].diameter - a.circles[0].diameter);

  let leftStartX = 50 + spacing;
  let rightStartX = 50 + width - spacing;
  let startY = 50 + height - spacing;

  groups.forEach(group => {
      const { side, circles } = group;
      circles.sort((a, b) => b.diameter - a.diameter); // Sort by diameter within the group

      let diameter = circles[0].diameter;
      let numRows, numCols;

      if (side === 'right') {
          numRows = Math.min(Math.floor((height - spacing) / (diameter + spacing)), 7);
          numCols = Math.min(Math.ceil(circles.length / numRows), 20);
      } else {
          numRows = Math.min(Math.floor((height - spacing) / (diameter + spacing)), 3);
          numCols = Math.min(Math.ceil(circles.length / numRows));
      }

      if (numRows > numCols) {
          numRows = Math.min(Math.ceil(Math.sqrt(circles.length)));
          numCols = Math.min(Math.ceil(Math.sqrt(circles.length)));
      }

      let startX = side === 'right' ? rightStartX : leftStartX;
      let currentX = startX;
      let currentY = startY;
      let rowCount = 0;
      let colCount = 0;

      circles.forEach(circle => {
          let { diameter, originalIndex } = circle;

          ctx.beginPath();
          ctx.arc(currentX + (side === 'right' ? -1 : 1) * (diameter / 2), currentY - (diameter / 2), diameter / 2, 0, 2 * Math.PI);
          ctx.stroke();

          // Draw the original order number inside the circle
          ctx.font = `${Math.min(diameter / 2, 40)}px Arial`;
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(originalIndex, currentX + (side === 'right' ? -1 : 1) * (diameter / 2), currentY - (diameter / 2));

          colCount++;
          if (colCount >= numCols) {
              colCount = 0;
              rowCount++;
              currentX = startX;
              currentY -= (diameter + spacing);
          } else {
              currentX += side === 'right' ? -(diameter + spacing) : (diameter + spacing);
          }

          if (rowCount >= numRows) {
              rowCount = 0;
              currentY -= (diameter + spacing);
          }
      });

      if (side === 'right') {
          rightStartX -= (numCols * (diameter + spacing) + spacing);
      } else {
          leftStartX += (numCols * (diameter + spacing) + spacing);
      }
  });
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
