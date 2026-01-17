import React, { useRef, useEffect, useState } from 'react';

/**
 * Simple 3D model viewer with rotation capability
 * Displays a placeholder 3D box that can be rotated by dragging
 */
export default function ModelViewer({ dimensions, className }) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f0f0f0');
    gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw 3D box (isometric projection)
    const size = Math.min(width, height) * 0.3;
    const depth = size * 0.6;

    // Convert rotation to radians
    const rx = rotation.x * (Math.PI / 180);
    const ry = rotation.y * (Math.PI / 180);

    // Calculate 3D points
    const vertices = [
      [-size/2, -size/2, -depth/2],
      [size/2, -size/2, -depth/2],
      [size/2, size/2, -depth/2],
      [-size/2, size/2, -depth/2],
      [-size/2, -size/2, depth/2],
      [size/2, -size/2, depth/2],
      [size/2, size/2, depth/2],
      [-size/2, size/2, depth/2],
    ];

    // Rotate vertices
    const rotatedVertices = vertices.map(([x, y, z]) => {
      // Rotate around Y axis
      let nx = x * Math.cos(ry) - z * Math.sin(ry);
      let nz = x * Math.sin(ry) + z * Math.cos(ry);
      
      // Rotate around X axis
      let ny = y * Math.cos(rx) - nz * Math.sin(rx);
      nz = y * Math.sin(rx) + nz * Math.cos(rx);

      return [nx, ny, nz];
    });

    // Project to 2D (isometric)
    const projected = rotatedVertices.map(([x, y, z]) => {
      const isoX = centerX + x - z * 0.5;
      const isoY = centerY + y - z * 0.5;
      return [isoX, isoY];
    });

    // Draw faces
    const faces = [
      { indices: [0, 1, 2, 3], color: '#667eea' }, // front
      { indices: [4, 7, 6, 5], color: '#764ba2' }, // back
      { indices: [0, 4, 5, 1], color: '#8b7fc8' }, // top
      { indices: [2, 6, 7, 3], color: '#5a67d8' }, // bottom
      { indices: [0, 3, 7, 4], color: '#4c51bf' }, // left
      { indices: [1, 5, 6, 2], color: '#7c3aed' }, // right
    ];

    // Sort faces by Z depth for proper rendering
    const faceDepths = faces.map((face, i) => {
      const faceZ = face.indices.reduce((sum, idx) => sum + rotatedVertices[idx][2], 0) / face.indices.length;
      return { face, depth: faceZ, index: i };
    });

    faceDepths.sort((a, b) => b.depth - a.depth);

    faceDepths.forEach(({ face }) => {
      ctx.beginPath();
      ctx.moveTo(projected[face.indices[0]][0], projected[face.indices[0]][1]);
      for (let i = 1; i < face.indices.length; i++) {
        ctx.lineTo(projected[face.indices[i]][0], projected[face.indices[i]][1]);
      }
      ctx.closePath();
      ctx.fillStyle = face.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw axes helper
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + 20, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [rotation]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setLastMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const deltaX = currentX - lastMousePos.x;
    const deltaY = currentY - lastMousePos.y;

    setRotation((prev) => ({
      x: prev.x + deltaY * 0.5,
      y: prev.y + deltaX * 0.5,
    }));

    setLastMousePos({ x: currentX, y: currentY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    setLastMousePos({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    const deltaX = currentX - lastMousePos.x;
    const deltaY = currentY - lastMousePos.y;

    setRotation((prev) => ({
      x: prev.x + deltaY * 0.5,
      y: prev.y + deltaX * 0.5,
    }));

    setLastMousePos({ x: currentX, y: currentY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        style={{
          width: '100%',
          height: '100%',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          borderRadius: '8px',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      <div style={{
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        fontSize: '10px',
        color: '#999',
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '4px 8px',
        borderRadius: '4px',
      }}>
        Drag to rotate
      </div>
    </div>
  );
}
