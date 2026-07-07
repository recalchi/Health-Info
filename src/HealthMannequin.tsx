import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { BodyArea } from "./data/conditions";

type LayerMode = "muscular" | "skeletal" | "organs" | "training";

type Props = {
  selectedArea: BodyArea;
  onSelectArea: (area: BodyArea) => void;
  layer: LayerMode;
};

type PartOptions = {
  area?: BodyArea;
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  color: number;
  opacity?: number;
  roughness?: number;
};

const highlightColors: Record<BodyArea, number> = {
  cabeca: 0x61c8ff,
  torax: 0x1ce5d0,
  abdome: 0xff9f4a,
  bracos: 0xff5774,
  pernas: 0x8d7bff,
};

const areaBaseColors: Record<BodyArea, number> = {
  cabeca: 0xc86d55,
  torax: 0xb94732,
  abdome: 0xc75a3a,
  bracos: 0xb84b37,
  pernas: 0xae4331,
};

function material(color: number, roughness = 0.5, opacity = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.04,
    transparent: opacity < 1,
    opacity,
  });
}

function ellipsoid({ area, position, scale, rotation = [0, 0, 0], color, opacity = 1, roughness = 0.56 }: PartOptions) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 40, 24), material(color, roughness, opacity));
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);
  if (area) {
    mesh.userData.area = area;
    mesh.userData.baseColor = color;
  }
  return mesh;
}

function capsule({ area, position, scale, rotation = [0, 0, 0], color, opacity = 1, roughness = 0.52 }: PartOptions) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 1, 18, 32), material(color, roughness, opacity));
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);
  if (area) {
    mesh.userData.area = area;
    mesh.userData.baseColor = color;
  }
  return mesh;
}

function bone(position: [number, number, number], scale: [number, number, number], rotation: [number, number, number] = [0, 0, 0]) {
  return capsule({
    position,
    scale,
    rotation,
    color: 0xd8d4c8,
    opacity: 0.72,
    roughness: 0.34,
  });
}

function rib(position: [number, number, number], scale: [number, number, number]) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.015, 8, 80), material(0xd8d4c8, 0.32, 0.56));
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  return mesh;
}

function vein(points: THREE.Vector3[], color = 0xffc28a) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.38 }),
  );
}

function makeRing(radius: number, y: number, color = 0x00d6e8) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.34, 0, Math.PI * 2);
  const points = curve.getPoints(140).map((point) => new THREE.Vector3(point.x, y, point.y));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.18 }));
}

export default function HealthMannequin({ selectedArea, onSelectArea, layer }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const selectedRef = useRef(selectedArea);
  const layerRef = useRef(layer);

  useEffect(() => {
    selectedRef.current = selectedArea;
  }, [selectedArea]);

  useEffect(() => {
    layerRef.current = layer;
  }, [layer]);

  useEffect(() => {
    const root = mountRef.current;
    if (!root) return;
    const container: HTMLDivElement = root;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.28, 9.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "anatomy-canvas";
    container.appendChild(renderer.domElement);

    const model = new THREE.Group();
    const body = new THREE.Group();
    const fibers = new THREE.Group();
    const skeleton = new THREE.Group();
    const organs = new THREE.Group();
    const training = new THREE.Group();
    const markers = new THREE.Group();
    model.scale.setScalar(0.9);
    model.position.y = -0.06;
    model.add(body, fibers, skeleton, organs, training, markers);
    scene.add(model);

    scene.add(makeRing(2.35, -2.58));
    scene.add(makeRing(1.98, -1.42, 0x1c86ff));
    scene.add(makeRing(1.58, 0.22, 0x1c86ff));

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.9);
    key.position.set(2.6, 4.4, 4.2);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x00e7ff, 2.1);
    rim.position.set(-4, 2.4, -3);
    scene.add(rim);
    const warm = new THREE.DirectionalLight(0xff8b66, 1.1);
    warm.position.set(3, -1, 2);
    scene.add(warm);

    const clickable: THREE.Mesh[] = [];
    const addBody = (mesh: THREE.Mesh) => {
      if (mesh.userData.area) clickable.push(mesh);
      body.add(mesh);
      return mesh;
    };

    addBody(ellipsoid({ area: "cabeca", position: [0, 2.66, 0.02], scale: [0.45, 0.6, 0.38], color: 0xc96b53 }));
    addBody(ellipsoid({ area: "cabeca", position: [0, 2.22, 0], scale: [0.22, 0.24, 0.22], color: 0x9a392d }));
    addBody(capsule({ area: "cabeca", position: [0, 1.95, 0], scale: [0.75, 0.34, 0.58], color: 0xa63f32 }));

    addBody(ellipsoid({ area: "torax", position: [-0.38, 1.48, 0.08], scale: [0.7, 0.44, 0.32], rotation: [0, 0, -0.08], color: 0xbc4932 }));
    addBody(ellipsoid({ area: "torax", position: [0.38, 1.48, 0.08], scale: [0.7, 0.44, 0.32], rotation: [0, 0, 0.08], color: 0xbc4932 }));
    addBody(ellipsoid({ area: "torax", position: [-0.78, 1.18, 0], scale: [0.3, 0.68, 0.24], rotation: [0, 0, -0.2], color: 0x8f302d }));
    addBody(ellipsoid({ area: "torax", position: [0.78, 1.18, 0], scale: [0.3, 0.68, 0.24], rotation: [0, 0, 0.2], color: 0x8f302d }));

    [-0.3, 0.3].forEach((x) => {
      [0.78, 0.46, 0.14].forEach((y, index) =>
        addBody(ellipsoid({
          area: "abdome",
          position: [x, y, 0.1],
          scale: [0.25, 0.19, 0.12],
          color: index === 0 ? 0xd66a42 : 0xc65d3e,
        })),
      );
    });
    addBody(ellipsoid({ area: "abdome", position: [0, -0.24, 0.03], scale: [0.7, 0.34, 0.24], color: 0xa94133 }));
    addBody(ellipsoid({ area: "abdome", position: [0, -0.58, 0], scale: [0.88, 0.26, 0.22], color: 0x8f302d }));

    [
      [-1.04, 1.48, 0.02, 0.38, 0.43, 0.32, -0.42],
      [1.04, 1.48, 0.02, 0.38, 0.43, 0.32, 0.42],
      [-1.3, 0.84, 0, 0.28, 0.72, 0.22, 0.16],
      [1.3, 0.84, 0, 0.28, 0.72, 0.22, -0.16],
      [-1.42, 0.04, 0.02, 0.22, 0.64, 0.18, -0.08],
      [1.42, 0.04, 0.02, 0.22, 0.64, 0.18, 0.08],
      [-1.4, -0.48, 0.06, 0.18, 0.18, 0.14, -0.2],
      [1.4, -0.48, 0.06, 0.18, 0.18, 0.14, 0.2],
    ].forEach(([x, y, z, sx, sy, sz, rz]) =>
      addBody(ellipsoid({
        area: "bracos",
        position: [x, y, z],
        scale: [sx, sy, sz],
        rotation: [0, 0, rz],
        color: 0xb84b37,
      })),
    );

    [
      [-0.44, -1.08, 0.02, 0.33, 0.82, 0.24, 0.06],
      [0.44, -1.08, 0.02, 0.33, 0.82, 0.24, -0.06],
      [-0.42, -1.98, 0.02, 0.24, 0.72, 0.18, -0.04],
      [0.42, -1.98, 0.02, 0.24, 0.72, 0.18, 0.04],
      [-0.45, -2.62, 0.16, 0.32, 0.12, 0.18, 0.08],
      [0.45, -2.62, 0.16, 0.32, 0.12, 0.18, -0.08],
    ].forEach(([x, y, z, sx, sy, sz, rz]) =>
      addBody(ellipsoid({
        area: "pernas",
        position: [x, y, z],
        scale: [sx, sy, sz],
        rotation: [0, 0, rz],
        color: 0xae4331,
      })),
    );

    fibers.add(vein([new THREE.Vector3(-0.72, 1.68, 0.42), new THREE.Vector3(-0.16, 1.42, 0.52), new THREE.Vector3(-0.54, 1.2, 0.46)]));
    fibers.add(vein([new THREE.Vector3(0.72, 1.68, 0.42), new THREE.Vector3(0.16, 1.42, 0.52), new THREE.Vector3(0.54, 1.2, 0.46)]));
    fibers.add(vein([new THREE.Vector3(-0.28, 0.86, 0.48), new THREE.Vector3(-0.12, 0.12, 0.5), new THREE.Vector3(-0.3, -0.28, 0.42)]));
    fibers.add(vein([new THREE.Vector3(0.28, 0.86, 0.48), new THREE.Vector3(0.12, 0.12, 0.5), new THREE.Vector3(0.3, -0.28, 0.42)]));
    fibers.add(vein([new THREE.Vector3(-0.5, -0.78, 0.42), new THREE.Vector3(-0.37, -1.54, 0.5), new THREE.Vector3(-0.42, -2.35, 0.4)], 0xff8a66));
    fibers.add(vein([new THREE.Vector3(0.5, -0.78, 0.42), new THREE.Vector3(0.37, -1.54, 0.5), new THREE.Vector3(0.42, -2.35, 0.4)], 0xff8a66));

    skeleton.add(ellipsoid({ position: [0, 2.66, 0], scale: [0.4, 0.54, 0.34], color: 0xd8d4c8, opacity: 0.7 }));
    skeleton.add(bone([0, 1.06, -0.02], [0.34, 1.65, 0.16]));
    [-0.58, -0.38, -0.18, 0.02, 0.22].forEach((y, index) => skeleton.add(rib([0, 1.36 - index * 0.18, 0], [1.42 - index * 0.08, 0.42, 0.24])));
    skeleton.add(rib([0, -0.48, 0], [1.05, 0.34, 0.18]));
    [
      [-1.22, 0.72, 0, 0.42, 1.05, 0.16, 0.08],
      [1.22, 0.72, 0, 0.42, 1.05, 0.16, -0.08],
      [-1.38, -0.05, 0, 0.32, 0.9, 0.14, -0.08],
      [1.38, -0.05, 0, 0.32, 0.9, 0.14, 0.08],
      [-0.43, -1.46, 0, 0.48, 1.52, 0.16, -0.04],
      [0.43, -1.46, 0, 0.48, 1.52, 0.16, 0.04],
    ].forEach(([x, y, z, sx, sy, sz, rz]) => skeleton.add(bone([x, y, z], [sx, sy, sz], [0, 0, rz])));

    organs.add(ellipsoid({ area: "torax", position: [-0.34, 1.34, 0.48], scale: [0.3, 0.5, 0.16], color: 0x5ebcf4, opacity: 0.9 }));
    organs.add(ellipsoid({ area: "torax", position: [0.34, 1.34, 0.48], scale: [0.3, 0.5, 0.16], color: 0x5ebcf4, opacity: 0.9 }));
    organs.add(ellipsoid({ area: "torax", position: [-0.08, 1.2, 0.62], scale: [0.22, 0.28, 0.16], color: 0xf04c4c, opacity: 0.96 }));
    organs.add(ellipsoid({ area: "abdome", position: [0.24, 0.14, 0.5], scale: [0.44, 0.2, 0.14], color: 0xf0a13f, opacity: 0.94 }));
    organs.add(ellipsoid({ area: "abdome", position: [-0.2, -0.16, 0.48], scale: [0.25, 0.26, 0.14], color: 0xe66f83, opacity: 0.9 }));

    [
      ["bracos", -1.08, 1.48, 0.5, 0.32, 0.32, 0.16],
      ["bracos", 1.08, 1.48, 0.5, 0.32, 0.32, 0.16],
      ["abdome", -0.28, 0.28, 0.54, 0.24, 0.2, 0.12],
      ["abdome", 0.28, 0.28, 0.54, 0.24, 0.2, 0.12],
      ["pernas", -0.44, -1.12, 0.48, 0.28, 0.58, 0.14],
      ["pernas", 0.44, -1.12, 0.48, 0.28, 0.58, 0.14],
    ].forEach(([area, x, y, z, sx, sy, sz]) => {
      training.add(ellipsoid({
        area: area as BodyArea,
        position: [Number(x), Number(y), Number(z)],
        scale: [Number(sx), Number(sy), Number(sz)],
        color: 0xff8b3d,
        opacity: 0.78,
      }));
    });

    const markerGeo = new THREE.SphereGeometry(0.075, 26, 18);
    [
      ["cabeca", 0, 2.72, 0.48],
      ["torax", -0.44, 1.52, 0.58],
      ["abdome", 0.3, 0.18, 0.56],
      ["bracos", 1.28, 0.76, 0.46],
      ["pernas", 0.48, -1.58, 0.46],
    ].forEach(([area, x, y, z]) => {
      const marker = new THREE.Mesh(
        markerGeo,
        new THREE.MeshStandardMaterial({ color: 0x10f6ff, emissive: 0x066b71, roughness: 0.2 }),
      );
      marker.position.set(Number(x), Number(y), Number(z));
      marker.userData.area = area;
      clickable.push(marker);
      markers.add(marker);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function resize() {
      const width = Math.max(container.clientWidth, 360);
      const height = Math.max(container.clientHeight, 560);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function selectFromEvent(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(clickable, false)[0];
      const area = hit?.object.userData.area;
      if (area) onSelectArea(area as BodyArea);
    }

    renderer.domElement.addEventListener("pointerdown", selectFromEvent);
    window.addEventListener("resize", resize);
    resize();

    let frame = 0;
    let animationId = 0;
    function animate() {
      frame += 0.012;
      model.rotation.y = Math.sin(frame) * 0.075;
      skeleton.visible = layerRef.current === "skeletal";
      organs.visible = layerRef.current === "organs";
      training.visible = layerRef.current === "training";
      markers.visible = layerRef.current !== "skeletal";
      fibers.visible = layerRef.current !== "skeletal";

      body.traverse((child) => {
        if (!(child instanceof THREE.Mesh) || !child.userData.area) return;
        const mat = child.material as THREE.MeshStandardMaterial;
        const area = child.userData.area as BodyArea;
        const active = area === selectedRef.current;
        const skeletalFade = layerRef.current === "skeletal" || layerRef.current === "organs";
        mat.color.setHex(active ? highlightColors[selectedRef.current] : child.userData.baseColor ?? areaBaseColors[area]);
        mat.emissive.setHex(active ? 0x073b40 : 0x000000);
        mat.opacity = skeletalFade ? 0.18 : active ? 1 : 0.82;
        mat.transparent = mat.opacity < 1;
      });

      training.children.forEach((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const mat = child.material as THREE.MeshStandardMaterial;
        const pulse = 0.68 + Math.sin(frame * 5) * 0.12;
        mat.opacity = pulse;
        child.scale.multiplyScalar(1);
      });

      markers.children.forEach((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const mat = child.material as THREE.MeshStandardMaterial;
        const active = child.userData.area === selectedRef.current;
        const pulse = active ? 1 + Math.sin(frame * 5) * 0.18 : 1;
        child.scale.setScalar(pulse);
        mat.color.setHex(active ? 0xffffff : 0x10f6ff);
      });

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener("pointerdown", selectFromEvent);
      window.removeEventListener("resize", resize);
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat) => mat.dispose());
        }
      });
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [onSelectArea]);

  return <div ref={mountRef} className="mannequin" aria-label="Modelo anatomico humanoide 3D interativo" />;
}
