import * as THREE from "three";

// AI Furniture item type with extended properties
export interface AIFurnitureItem {
  id: string;
  name: string;
  modelUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
  dimensions?: {
    width: number;
    depth: number;
    height: number;
  };
  furnitureType?: string;
  material?: string;
  details?: {
    woodFinish?: "light" | "medium" | "dark";
    hasDrawers?: boolean;
    hasShelves?: boolean;
    numberOfDrawers?: number;
    numberOfShelves?: number;
  };
}

interface FurnitureSpec {
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  color: string;
  material?: string;
  furnitureType?: string;
  details?: {
    woodFinish?: "light" | "medium" | "dark";
    hasDrawers?: boolean;
    hasShelves?: boolean;
    numberOfDrawers?: number;
    numberOfShelves?: number;
  };
}

export function createFurnitureFromSpec(item: AIFurnitureItem): THREE.Group {
  const spec: FurnitureSpec = {
    dimensions: item.dimensions || { width: 2, depth: 2, height: 2 },
    color: item.color || "#8B4513",
    material: item.material,
    furnitureType: item.furnitureType,
    details: item.details,
  };

  const type = item.furnitureType || item.name.toLowerCase();

  switch (type) {
    case "bed":
      return createBed(spec);
    case "desk":
      return createDesk(spec);
    case "chair":
      return createChair(spec);
    case "wardrobe":
    case "closet":
      return createWardrobe(spec);
    case "nightstand":
    case "night-stand":
      return createNightstand(spec);
    case "dresser":
      return createDresser(spec);
    case "bookshelf":
    case "shelf":
      return createBookshelf(spec);
    case "table":
    case "coffee-table":
    case "side-table":
      return createTable(spec);
    case "sofa":
    case "couch":
      return createSofa(spec);
    case "lamp":
    case "floor-lamp":
    case "desk-lamp":
      return createLamp(spec);
    case "plant":
      return createPlant(spec);
    case "rug":
    case "carpet":
      return createRug(spec);
    default:
      return createGenericBox(spec);
  }
}

function getMaterial(color: string, materialType?: string): THREE.MeshStandardMaterial {
  const baseColor = new THREE.Color(color);
  
  switch (materialType) {
    case "wood":
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.6,
        metalness: 0.1,
      });
    case "metal":
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.3,
        metalness: 0.8,
      });
    case "fabric":
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.9,
        metalness: 0,
      });
    case "leather":
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.5,
        metalness: 0.1,
      });
    case "plastic":
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.4,
        metalness: 0.2,
      });
    default:
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.5,
        metalness: 0.1,
      });
  }
}

function createBed(spec: FurnitureSpec): THREE.Group {
  const group = new THREE.Group();
  const { width, depth, height } = spec.dimensions;
  const material = getMaterial(spec.color, spec.material);

  // Bed frame
  const frameGeometry = new THREE.BoxGeometry(width, 0.3, depth);
  const frame = new THREE.Mesh(frameGeometry, material);
  frame.position.y = 0.15;
  frame.castShadow = true;
  frame.receiveShadow = true;
  group.add(frame);

  // Mattress
  const mattressGeometry = new THREE.BoxGeometry(width - 0.2, height - 0.3, depth - 0.2);
  const mattressMaterial = new THREE.MeshStandardMaterial({
    color: "#F5F5F5",
    roughness: 0.8,
  });
  const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
  mattress.position.y = 0.3 + (height - 0.3) / 2;
  mattress.castShadow = true;
  group.add(mattress);

  // Headboard
  const headboardGeometry = new THREE.BoxGeometry(width, height + 1, 0.2);
  const headboard = new THREE.Mesh(headboardGeometry, material);
  headboard.position.y = (height + 1) / 2;
  headboard.position.z = -depth / 2 + 0.1;
  headboard.castShadow = true;
  group.add(headboard);

  // Pillows
  const pillowGeometry = new THREE.BoxGeometry(width * 0.35, 0.3, 0.5);
  const pillowMaterial = new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.9 });
  
  const pillow1 = new THREE.Mesh(pillowGeometry, pillowMaterial);
  pillow1.position.set(-width * 0.25, height + 0.15, -depth / 2 + 0.6);
  group.add(pillow1);
  
  const pillow2 = new THREE.Mesh(pillowGeometry, pillowMaterial);
  pillow2.position.set(width * 0.25, height + 0.15, -depth / 2 + 0.6);
  group.add(pillow2);

  return group;
}

function createDesk(spec: FurnitureSpec): THREE.Group {
  const group = new THREE.Group();
  const { width, depth, height } = spec.dimensions;
  const material = getMaterial(spec.color, spec.material);

  // Desktop
  const topGeometry = new THREE.BoxGeometry(width, 0.1, depth);
  const top = new THREE.Mesh(topGeometry, material);
  top.position.y = height - 0.05;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // Legs
  const legGeometry = new THREE.BoxGeometry(0.1, height - 0.1, 0.1);
  const legPositions = [
    [-width / 2 + 0.1, (height - 0.1) / 2, -depth / 2 + 0.1],
    [width / 2 - 0.1, (height - 0.1) / 2, -depth / 2 + 0.1],
    [-width / 2 + 0.1, (height - 0.1) / 2, depth / 2 - 0.1],
    [width / 2 - 0.1, (height - 0.1) / 2, depth / 2 - 0.1],
  ];

  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeometry, material);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    group.add(leg);
  });

  // Drawers if specified
  if (spec.details?.hasDrawers) {
    const numDrawers = spec.details.numberOfDrawers || 3;
    const drawerWidth = width * 0.4;
    const drawerHeight = (height - 0.2) / numDrawers;

    for (let i = 0; i < numDrawers; i++) {
      const drawerGeometry = new THREE.BoxGeometry(drawerWidth, drawerHeight - 0.1, depth * 0.9);
      const drawerMaterial = getMaterial(
        new THREE.Color(spec.color).multiplyScalar(0.9).getHexString(),
        spec.material
      );
      const drawer = new THREE.Mesh(drawerGeometry, drawerMaterial);
      drawer.position.set(width * 0.3, 0.1 + i * drawerHeight + drawerHeight / 2, 0);
      group.add(drawer);

      // Drawer handle
      const handleGeometry = new THREE.BoxGeometry(drawerWidth * 0.3, 0.05, 0.1);
      const handleMaterial = new THREE.MeshStandardMaterial({ color: "#666666", metalness: 0.8 });
      const handle = new THREE.Mesh(handleGeometry, handleMaterial);
      handle.position.set(width * 0.3, 0.1 + i * drawerHeight + drawerHeight / 2, depth * 0.45 + 0.05);
      group.add(handle);
    }
  }

  return group;
}

function createChair(spec: FurnitureSpec): THREE.Group {
  const group = new THREE.Group();
  const { width, depth, height } = spec.dimensions;
  const material = getMaterial(spec.color, spec.material);

  // Seat
  const seatHeight = height * 0.4;
  const seatGeometry = new THREE.BoxGeometry(width, 0.15, depth);
  const seat = new THREE.Mesh(seatGeometry, material);
  seat.position.y = seatHeight;
  seat.castShadow = true;
  group.add(seat);

  // Backrest
  const backGeometry = new THREE.BoxGeometry(width, height * 0.5, 0.1);
  const back = new THREE.Mesh(backGeometry, material);
  back.position.y = height * 0.65;
  back.position.z = -depth / 2 + 0.05;
  back.castShadow = true;
  group.add(back);

  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, seatHeight);
  const legMaterial = getMaterial("#444444", "metal");
  const legPositions = [
    [-width / 2 + 0.1, seatHeight / 2, -depth / 2 + 0.1],
    [width / 2 - 0.1, seatHeight / 2, -depth / 2 + 0.1],
    [-width / 2 + 0.1, seatHeight / 2, depth / 2 - 0.1],
    [width / 2 - 0.1, seatHeight / 2, depth / 2 - 0.1],
  ];

  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    group.add(leg);
  });

  return group;
}

function createWardrobe(spec: FurnitureSpec): THREE.Group {
  const group = new THREE.Group();
  const { width, depth, height } = spec.dimensions;
  const material = getMaterial(spec.color, spec.material);

  // Main body
  const bodyGeometry = new THREE.BoxGeometry(width, height, depth);
  const body = new THREE.Mesh(bodyGeometry, material);
  body.position.y = height / 2;
  body.castShadow = true;
  group.add(body);

  // Door panels
  const doorWidth = width / 2 - 0.05;
  const doorGeometry = new THREE.BoxGeometry(doorWidth, height - 0.1, 0.05);
  const doorMaterial = getMaterial(
    new THREE.Color(spec.color).multiplyScalar(1.1).getHexString(),
    spec.material
  );

  const leftDoor = new THREE.Mesh(doorGeometry, doorMaterial);
  leftDoor.position.set(-width / 4, height / 2, depth / 2 + 0.025);
  group.add(leftDoor);

  const rightDoor = new THREE.Mesh(doorGeometry, doorMaterial);
  rightDoor.position.set(width / 4, height / 2, depth / 2 + 0.025);
  group.add(rightDoor);

  // Handles
  const handleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3);
  const handleMaterial = new THREE.MeshStandardMaterial({ color: "#888888", metalness: 0.8 });

  const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
  leftHandle.rotation.x = Math.PI / 2;
  leftHandle.position.set(-0.1, height / 2, depth / 2 + 0.1);
  group.add(leftHandle);

  const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
  rightHandle.rotation.x = Math.PI / 2;
  rightHandle.position.set(0.1, height / 2, depth / 2 + 0.1);
  group.add(rightHandle);

  return group;
}

function createNightstand(spec: FurnitureSpec): THREE.Group {
  const group = new THREE.Group();
  const { width, depth, height } = spec.dimensions;
  const material = getMaterial(spec.color, spec.material);

  // Body
  const bodyGeometry = new THREE.BoxGeometry(width, height, depth);
  const body = new THREE.Mesh(bodyGeometry, material);
  body.position.y = height / 2;
  body.castShadow = true;
  group.add(body);

  // Drawer fronts
  const numDrawers = spec.details?.numberOfDrawers || 2;
  const drawerHeight = height / numDrawers;

  for (let i = 0; i < numDrawers; i++) {
    const drawerFrontGeometry = new THREE.BoxGeometry(width - 0.1, drawerHeight - 0.1, 0.05);
    const drawerFront = new THREE.Mesh(
      drawerFrontGeometry,
      getMaterial(new THREE.Color(spec.color).multiplyScalar(0.95).getHexString(), spec.material)
    );
    drawerFront.position.set(0, i * drawerHeight + drawerHeight / 2, depth / 2 + 0.025);
    group.add(drawerFront);

    // Handle
    const handleGeometry = new THREE.BoxGeometry(width * 0.4, 0.05, 0.05);
    const handleMaterial = new THREE.MeshStandardMaterial({ color: "#666666", metalness: 0.7 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0, i * drawerHeight + drawerHeight / 2, depth / 2 + 0.08);
    group.add(handle);
  }

  return group;
}

function createDresser(spec: FurnitureSpec): THREE.Group {
  // Similar to nightstand but with more drawers
  const modifiedSpec = {
    ...spec,
    details: { ...spec.details, numberOfDrawers: spec.details?.numberOfDrawers || 4 },
  };
  return createNightstand(modifiedSpec);
}

function createBookshelf(spec: FurnitureSpec): THREE.Group {
  const group = new THREE.Group();
  const { width, depth, height } = spec.dimensions;
  const material = getMaterial(spec.color, spec.material);

  // Sides
  const sideGeometry = new THREE.BoxGeometry(0.1, height, depth);
  const leftSide = new THREE.Mesh(sideGeometry, material);
  leftSide.position.set(-width / 2 + 0.05, height / 2, 0);
  leftSide.castShadow = true;
  group.add(leftSide);

  const rightSide = new THREE.Mesh(sideGeometry, material);
  rightSide.position.set(width / 2 - 0.05, height / 2, 0);
  rightSide.castShadow = true;
  group.add(rightSide);

  // Shelves
  const numShelves = spec.details?.numberOfShelves || 5;
  const shelfSpacing = height / numShelves;
  const shelfGeometry = new THREE.BoxGeometry(width - 0.2, 0.08, depth);

  for (let i = 0; i <= numShelves; i++) {
    const shelf = new THREE.Mesh(shelfGeometry, material);
    shelf.position.y = i * shelfSpacing;
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    group.add(shelf);
  }

  // Back panel
  const backGeometry = new THREE.BoxGeometry(width - 0.2, height, 0.05);
  const back = new THREE.Mesh(backGeometry, material);
  back.position.set(0, height / 2, -depth / 2 + 0.025);
  group.add(back);

  return group;
}

function createTable(spec: FurnitureSpec): THREE.Group {
  const group = new THREE.Group();
  const { width, depth, height } = spec.dimensions;
  const material = getMaterial(spec.color, spec.material);

  // Table top
  const topGeometry = new THREE.BoxGeometry(width, 0.1, depth);
  const top = new THREE.Mesh(topGeometry, material);
  top.position.y = height - 0.05;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // Legs
  const legGeometry = new THREE.BoxGeometry(0.1, height - 0.1, 0.1);
  const legPositions = [
    [-width / 2 + 0.15, (height - 0.1) / 2, -depth / 2 + 0.15],
    [width / 2 - 0.15, (height - 0.1) / 2, -depth / 2 + 0.15],
    [-width / 2 + 0.15, (height - 0.1) / 2, depth / 2 - 0.15],
    [width / 2 - 0.15, (height - 0.1) / 2, depth / 2 - 0.15],
  ];

  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeometry, material);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    group.add(leg);
  });

  return group;
}

function createSofa(spec: FurnitureSpec): THREE.Group {
  const group = new THREE.Group();
  const { width, depth, height } = spec.dimensions;
  const material = getMaterial(spec.color, spec.material || "fabric");

  // Base
  const baseGeometry = new THREE.BoxGeometry(width, height * 0.3, depth);
  const base = new THREE.Mesh(baseGeometry, material);
  base.position.y = height * 0.15;
  base.castShadow = true;
  group.add(base);

  // Seat cushion
  const seatGeometry = new THREE.BoxGeometry(width - 0.2, height * 0.2, depth - 0.3);
  const seat = new THREE.Mesh(seatGeometry, material);
  seat.position.y = height * 0.4;
  seat.position.z = 0.1;
  seat.castShadow = true;
  group.add(seat);

  // Backrest
  const backGeometry = new THREE.BoxGeometry(width, height * 0.5, 0.3);
  const back = new THREE.Mesh(backGeometry, material);
  back.position.y = height * 0.55;
  back.position.z = -depth / 2 + 0.15;
  back.castShadow = true;
  group.add(back);

  // Armrests
  const armGeometry = new THREE.BoxGeometry(0.2, height * 0.35, depth);
  const leftArm = new THREE.Mesh(armGeometry, material);
  leftArm.position.set(-width / 2 + 0.1, height * 0.35, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeometry, material);
  rightArm.position.set(width / 2 - 0.1, height * 0.35, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  return group;
}

function createLamp(spec: FurnitureSpec): THREE.Group {
  const group = new THREE.Group();
  const { width, height } = spec.dimensions;
  const isFloorLamp = height > 3;

  // Base
  const baseRadius = width / 3;
  const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius * 1.2, 0.1, 32);
  const baseMaterial = getMaterial("#333333", "metal");
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 0.05;
  base.castShadow = true;
  group.add(base);

  // Pole
  const poleGeometry = new THREE.CylinderGeometry(0.03, 0.03, height * 0.7, 16);
  const pole = new THREE.Mesh(poleGeometry, baseMaterial);
  pole.position.y = height * 0.35 + 0.1;
  pole.castShadow = true;
  group.add(pole);

  // Shade
  const shadeGeometry = new THREE.ConeGeometry(width / 2, height * 0.25, 32, 1, true);
  const shadeMaterial = new THREE.MeshStandardMaterial({
    color: spec.color || "#FFFFFF",
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
  shade.position.y = height * 0.85;
  shade.rotation.x = Math.PI;
  shade.castShadow = true;
  group.add(shade);

  // Light source
  const light = new THREE.PointLight(0xFFE4B5, isFloorLamp ? 0.5 : 0.3, isFloorLamp ? 8 : 4);
  light.position.y = height * 0.8;
  group.add(light);

  return group;
}

function createPlant(spec: FurnitureSpec): THREE.Group {
  const group = new THREE.Group();
  const { width, height } = spec.dimensions;

  // Pot
  const potGeometry = new THREE.CylinderGeometry(width / 3, width / 4, height * 0.3, 16);
  const potMaterial = new THREE.MeshStandardMaterial({ color: "#8B4513", roughness: 0.8 });
  const pot = new THREE.Mesh(potGeometry, potMaterial);
  pot.position.y = height * 0.15;
  pot.castShadow = true;
  group.add(pot);

  // Soil
  const soilGeometry = new THREE.CylinderGeometry(width / 3 - 0.05, width / 3 - 0.05, 0.1, 16);
  const soilMaterial = new THREE.MeshStandardMaterial({ color: "#3D2817", roughness: 1 });
  const soil = new THREE.Mesh(soilGeometry, soilMaterial);
  soil.position.y = height * 0.3;
  group.add(soil);

  // Foliage (simplified as a sphere cluster)
  const foliageMaterial = new THREE.MeshStandardMaterial({ color: "#228B22", roughness: 0.8 });
  const foliageCount = 5;
  for (let i = 0; i < foliageCount; i++) {
    const radius = (width / 4) * (0.7 + Math.random() * 0.3);
    const foliageGeometry = new THREE.SphereGeometry(radius, 16, 16);
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.set(
      (Math.random() - 0.5) * width * 0.4,
      height * 0.5 + Math.random() * height * 0.4,
      (Math.random() - 0.5) * width * 0.4
    );
    foliage.castShadow = true;
    group.add(foliage);
  }

  return group;
}

function createRug(spec: FurnitureSpec): THREE.Group {
  const group = new THREE.Group();
  const { width, depth } = spec.dimensions;

  const rugGeometry = new THREE.PlaneGeometry(width, depth);
  const rugMaterial = new THREE.MeshStandardMaterial({
    color: spec.color,
    roughness: 0.95,
    side: THREE.DoubleSide,
  });
  const rug = new THREE.Mesh(rugGeometry, rugMaterial);
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.01;
  rug.receiveShadow = true;
  group.add(rug);

  return group;
}

function createGenericBox(spec: FurnitureSpec): THREE.Group {
  const group = new THREE.Group();
  const { width, depth, height } = spec.dimensions;
  const material = getMaterial(spec.color, spec.material);

  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = height / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  return group;
}
