import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * 3D model viewer with Three.js
 * Displays BILLY bookcase model when detected, otherwise shows placeholder
 */
export default function ModelViewer({ dimensions, className, productName }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(5);
  const autoRotateRef = useRef(true);
  const idleTimerRef = useRef(null);

  // Check if product is BILLY bookcase
  const isBillyBookcase = productName && productName.toLowerCase().includes('billy');

  // Create BILLY bookcase 3D model
  const createBillyBookcase = () => {
    const group = new THREE.Group();
    
    // Scale factor: 1 Three.js unit = 10 cm (so 202cm = 20.2 units)
    const scale = 0.1;
    
    // Dimensions in cm, then scaled to Three.js units
    const width = 40 * scale;   // 4.0 units
    const depth = 28 * scale;   // 2.8 units
    const height = 202 * scale; // 20.2 units
    const thickness = 1.8 * scale; // 0.18 units
    
    // Base color - white
    const whiteMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
    const edgeMaterial = new THREE.MeshLambertMaterial({ color: 0xe8e8e8 });
    
    // Create frame (4 vertical posts)
    const postWidth = thickness;
    const postDepth = thickness;
    
    // Back posts (left and right)
    const leftBackPost = new THREE.Mesh(
      new THREE.BoxGeometry(postWidth, height, postDepth),
      whiteMaterial
    );
    leftBackPost.position.set(-width/2 + postWidth/2, height/2, -depth/2 + postDepth/2);
    group.add(leftBackPost);
    
    const rightBackPost = new THREE.Mesh(
      new THREE.BoxGeometry(postWidth, height, postDepth),
      whiteMaterial
    );
    rightBackPost.position.set(width/2 - postWidth/2, height/2, -depth/2 + postDepth/2);
    group.add(rightBackPost);
    
    // Front posts (left and right)
    const leftFrontPost = new THREE.Mesh(
      new THREE.BoxGeometry(postWidth, height, postDepth),
      whiteMaterial
    );
    leftFrontPost.position.set(-width/2 + postWidth/2, height/2, depth/2 - postDepth/2);
    group.add(leftFrontPost);
    
    const rightFrontPost = new THREE.Mesh(
      new THREE.BoxGeometry(postWidth, height, postDepth),
      whiteMaterial
    );
    rightFrontPost.position.set(width/2 - postWidth/2, height/2, depth/2 - postDepth/2);
    group.add(rightFrontPost);
    
    // Top panel
    const topPanel = new THREE.Mesh(
      new THREE.BoxGeometry(width, thickness, depth),
      whiteMaterial
    );
    topPanel.position.set(0, height - thickness/2, 0);
    group.add(topPanel);
    
    // Bottom panel (resting on floor, no base)
    const bottomPanel = new THREE.Mesh(
      new THREE.BoxGeometry(width, thickness, depth),
      whiteMaterial
    );
    bottomPanel.position.set(0, thickness/2, 0);
    group.add(bottomPanel);
    
    // Back panel
    const backPanel = new THREE.Mesh(
      new THREE.BoxGeometry(width - postWidth * 2, height - thickness * 2, 0.5),
      edgeMaterial
    );
    backPanel.position.set(0, height/2, -depth/2 + 0.25);
    group.add(backPanel);
    
    // 5 adjustable shelves (creating 6 compartments)
    const shelfSpacing = (height - thickness * 2) / 6;
    const wallThickness = 0.3 * scale; // Thinner walls
    const wallDepth = depth - postWidth * 2;
    
    // Side walls for top compartment (between top panel and first shelf)
    const firstShelfY = thickness + shelfSpacing;
    // Top compartment: from bottom of top panel to top of first shelf
    const topPanelBottom = height - thickness;
    const firstShelfTop = firstShelfY + thickness/2;
    const topCompartmentHeight = topPanelBottom - firstShelfTop;
    const topCompartmentCenterY = (topPanelBottom + firstShelfTop) / 2;
    
    // Left side wall for top compartment
    const topLeftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, topCompartmentHeight, wallDepth),
      whiteMaterial
    );
    topLeftWall.position.set(
      -width/2 + postWidth + wallThickness/2,
      topCompartmentCenterY,
      0
    );
    group.add(topLeftWall);
    
    // Right side wall for top compartment
    const topRightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, topCompartmentHeight, wallDepth),
      whiteMaterial
    );
    topRightWall.position.set(
      width/2 - postWidth - wallThickness/2,
      topCompartmentCenterY,
      0
    );
    group.add(topRightWall);
    
    // Create shelves and side walls for middle compartments
    for (let i = 0; i < 5; i++) {
      const shelfY = thickness + shelfSpacing * (i + 1);
      
      // Shelf
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(width - postWidth * 2, thickness, depth - postWidth * 2),
        whiteMaterial
      );
      shelf.position.set(0, shelfY, 0);
      group.add(shelf);
      
      // Side walls for each middle compartment (between shelves)
      if (i < 4) {
        // Compartment height is shelfSpacing minus thickness of shelves
        const compartmentHeight = shelfSpacing - thickness;
        const compartmentCenterY = shelfY + shelfSpacing / 2;
        
        // Left side wall
        const leftWall = new THREE.Mesh(
          new THREE.BoxGeometry(wallThickness, compartmentHeight, wallDepth),
          whiteMaterial
        );
        leftWall.position.set(
          -width/2 + postWidth + wallThickness/2,
          compartmentCenterY,
          0
        );
        group.add(leftWall);
        
        // Right side wall
        const rightWall = new THREE.Mesh(
          new THREE.BoxGeometry(wallThickness, compartmentHeight, wallDepth),
          whiteMaterial
        );
        rightWall.position.set(
          width/2 - postWidth - wallThickness/2,
          compartmentCenterY,
          0
        );
        group.add(rightWall);
      }
    }
    
    // Side walls for bottom compartment (between last shelf and bottom panel)
    const lastShelfY = thickness + shelfSpacing * 5;
    const bottomCompartmentHeight = lastShelfY - thickness;
    
    // Left side wall for bottom compartment
    const bottomLeftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, bottomCompartmentHeight, wallDepth),
      whiteMaterial
    );
    bottomLeftWall.position.set(
      -width/2 + postWidth + wallThickness/2,
      (lastShelfY + thickness) / 2,
      0
    );
    group.add(bottomLeftWall);
    
    // Right side wall for bottom compartment
    const bottomRightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, bottomCompartmentHeight, wallDepth),
      whiteMaterial
    );
    bottomRightWall.position.set(
      width/2 - postWidth - wallThickness/2,
      (lastShelfY + thickness) / 2,
      0
    );
    group.add(bottomRightWall);
    
    // Center the model
    group.position.y = -height/2;
    
    return group;
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    sceneRef.current = scene;

    // Camera setup
    const width = containerRef.current.clientWidth || 270;
    const height = containerRef.current.clientHeight || 150;
    const camera = new THREE.PerspectiveCamera(
      50,
      width / height,
      0.1,
      1000
    );
    camera.position.set(0, 0, 250);
    cameraRef.current = camera;
    zoomRef.current = 250;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight1.position.set(5, 10, 5);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-5, 5, -5);
    scene.add(directionalLight2);

    // Create model
    let model;
    if (isBillyBookcase) {
      model = createBillyBookcase();
      scene.add(model);
      meshRef.current = model;
      
      // Adjust camera to fit model nicely
      // Scaled model: ~4 units wide x 20.2 units tall x 2.8 units deep
      const distance = 25; // Good viewing distance
      camera.position.set(distance * 0.7, distance * 0.4, distance * 0.8);
      camera.lookAt(0, 0, 0);
      zoomRef.current = camera.position.length();
    } else {
      // Placeholder box
      const geometry = new THREE.BoxGeometry(10, 15, 8);
      const material = new THREE.MeshLambertMaterial({ color: 0x667eea });
      model = new THREE.Mesh(geometry, material);
      scene.add(model);
      meshRef.current = model;
      
      // Position camera for placeholder
      camera.position.set(0, 5, 25);
      camera.lookAt(0, 0, 0);
      zoomRef.current = camera.position.length();
    }

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (meshRef.current) {
        if (autoRotateRef.current && !isDragging) {
          meshRef.current.rotation.y += 0.005;
          rotationRef.current.y = meshRef.current.rotation.y;
        } else if (isDragging) {
          meshRef.current.rotation.y = rotationRef.current.y;
          meshRef.current.rotation.x = rotationRef.current.x;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && containerRef.current) {
          try {
            containerRef.current.removeChild(renderer.domElement);
          } catch (e) {
            // Element may already be removed
          }
        }
      }
      if (model) {
        model.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, [isBillyBookcase, productName]);

  // Handle mouse/touch interactions
  const handleMouseDown = (e) => {
    setIsDragging(true);
    autoRotateRef.current = false;
    clearTimeout(idleTimerRef.current);
    
    const rect = containerRef.current.getBoundingClientRect();
    setLastMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !meshRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const deltaX = (currentX - lastMousePos.x) * 0.01;
    const deltaY = (currentY - lastMousePos.y) * 0.01;

    rotationRef.current.y += deltaX;
    rotationRef.current.x -= deltaY;
    rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x));
    
    meshRef.current.rotation.y = rotationRef.current.y;
    meshRef.current.rotation.x = rotationRef.current.x;

    setLastMousePos({ x: currentX, y: currentY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Resume auto-rotation after 2 seconds of idle
    idleTimerRef.current = setTimeout(() => {
      autoRotateRef.current = true;
    }, 2000);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    autoRotateRef.current = false;
    clearTimeout(idleTimerRef.current);
    
      const delta = e.deltaY * 0.01;
      if (cameraRef.current) {
        const currentDistance = cameraRef.current.position.length();
        const newDistance = Math.max(15, Math.min(50, currentDistance + delta));
        zoomRef.current = newDistance;
        
        const ratio = newDistance / currentDistance;
        cameraRef.current.position.multiplyScalar(ratio);
      }
    
    // Resume auto-rotation after 2 seconds
    idleTimerRef.current = setTimeout(() => {
      autoRotateRef.current = true;
    }, 2000);
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    setLastMousePos({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setIsDragging(true);
    autoRotateRef.current = false;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    const deltaX = (currentX - lastMousePos.x) * 0.01;
    const deltaY = (currentY - lastMousePos.y) * 0.01;

    if (meshRef.current) {
      rotationRef.current.y += deltaX;
      rotationRef.current.x -= deltaY;
      rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x));
      
      meshRef.current.rotation.y = rotationRef.current.y;
      meshRef.current.rotation.x = rotationRef.current.x;
    }

    setLastMousePos({ x: currentX, y: currentY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    idleTimerRef.current = setTimeout(() => {
      autoRotateRef.current = true;
    }, 2000);
  };

  // Pinch zoom for touch
  let lastTouchDistance = 0;
  const handleTouchMoveZoom = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (lastTouchDistance > 0 && cameraRef.current) {
        const currentDistance = cameraRef.current.position.length();
        const delta = (lastTouchDistance - distance) * 0.1;
        const newDistance = Math.max(15, Math.min(50, currentDistance + delta));
        zoomRef.current = newDistance;
        
        const ratio = newDistance / currentDistance;
        cameraRef.current.position.multiplyScalar(ratio);
      }
      lastTouchDistance = distance;
    } else {
      lastTouchDistance = 0;
      handleTouchMove(e);
    }
  };

  return (
    <div 
      className={className} 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        overflow: 'hidden'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMoveZoom}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{
        position: 'absolute',
        bottom: '6px',
        right: '6px',
        fontSize: '8px',
        color: '#999',
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '3px 6px',
        borderRadius: '3px',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        {isBillyBookcase ? 'Drag to rotate, scroll to zoom' : 'Drag to rotate'}
      </div>
    </div>
  );
}
