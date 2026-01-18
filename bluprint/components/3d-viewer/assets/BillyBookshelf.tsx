/**
 * IKEA BILLY Bookcase - Exact dimensions
 * White matte finish, tall and slim profile
 * BILLY: 40 x 28 x 202 cm (W x D x H)
 * 6 equal compartments (5 internal shelves + bottom space)
 */

import { useRef } from 'react';

interface BillyBookshelfProps {
  position?: [number, number, number];
  rotation?: number;
  scale?: number;
}

export default function BillyBookshelf({
  position = [0, 0, 0],
  rotation = 0,
  scale = 1
}: BillyBookshelfProps) {
  const groupRef = useRef<any>(null);

  // EXACT IKEA BILLY dimensions in meters
  // 40cm x 28cm x 202cm (W x D x H)
  const WIDTH = 0.40;   // 40cm width
  const DEPTH = 0.28;   // 28cm depth
  const HEIGHT = 2.02;  // 202cm height

  // Panel thickness: realistic IKEA particle board (~18mm)
  const PANEL_THICKNESS = 0.018; // 18mm for sides/top/bottom/shelves

  // Back panel: thin (3mm) slightly inset to avoid z-fighting
  const BACK_THICKNESS = 0.003; // 3mm
  const BACK_INSET = 0.0005; // Small epsilon to prevent z-fighting

  // White matte finish (matching IKEA Billy white)
  const WHITE_COLOR = '#FFFFFF';

  // 6 equal compartments = 5 internal shelves + bottom space
  const NUM_COMPARTMENTS = 6;

  // Available interior height (subtract top panel)
  const interiorHeight = HEIGHT - PANEL_THICKNESS;
  const COMPARTMENT_HEIGHT = interiorHeight / NUM_COMPARTMENTS;

  // Interior width for shelves (between side panels)
  const interiorWidth = WIDTH - (PANEL_THICKNESS * 2);
  const interiorDepth = DEPTH - BACK_THICKNESS - BACK_INSET;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotation, 0]}
      scale={scale}
    >
      {/* Back panel - thin, inset slightly */}
      <mesh
        position={[0, HEIGHT / 2, -DEPTH / 2 + BACK_THICKNESS / 2 + BACK_INSET]}
        castShadow
      >
        <boxGeometry args={[WIDTH, HEIGHT, BACK_THICKNESS]} />
        <meshStandardMaterial
          color={WHITE_COLOR}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Left side panel - full height */}
      <mesh
        position={[-WIDTH / 2 + PANEL_THICKNESS / 2, HEIGHT / 2, 0]}
        castShadow
      >
        <boxGeometry args={[PANEL_THICKNESS, HEIGHT, DEPTH]} />
        <meshStandardMaterial
          color={WHITE_COLOR}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Right side panel - full height */}
      <mesh
        position={[WIDTH / 2 - PANEL_THICKNESS / 2, HEIGHT / 2, 0]}
        castShadow
      >
        <boxGeometry args={[PANEL_THICKNESS, HEIGHT, DEPTH]} />
        <meshStandardMaterial
          color={WHITE_COLOR}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Top panel */}
      <mesh
        position={[0, HEIGHT - PANEL_THICKNESS / 2, 0]}
        castShadow
      >
        <boxGeometry args={[WIDTH, PANEL_THICKNESS, DEPTH]} />
        <meshStandardMaterial
          color={WHITE_COLOR}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Bottom panel (floor of shelf) */}
      <mesh
        position={[0, PANEL_THICKNESS / 2, 0]}
        castShadow
      >
        <boxGeometry args={[WIDTH, PANEL_THICKNESS, DEPTH]} />
        <meshStandardMaterial
          color={WHITE_COLOR}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* 5 internal shelves (creating 6 equal compartments total) */}
      {[1, 2, 3, 4, 5].map((shelfNum) => {
        // Each shelf is at bottom_panel_top + (compartmentHeight * shelfNum)
        const shelfY = PANEL_THICKNESS + (COMPARTMENT_HEIGHT * shelfNum);

        return (
          <mesh
            key={`shelf-${shelfNum}`}
            position={[0, shelfY, 0]}
            castShadow
          >
            {/* Shelves fit between side panels (inset) */}
            <boxGeometry args={[interiorWidth, PANEL_THICKNESS, interiorDepth]} />
            <meshStandardMaterial
              color={WHITE_COLOR}
              roughness={0.85}
              metalness={0.05}
            />
          </mesh>
        );
      })}
    </group>
  );
}
