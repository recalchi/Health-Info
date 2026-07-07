import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { BodyArea } from "./data/conditions";

type Props = {
  selectedArea: BodyArea;
  onSelectArea: (area: BodyArea) => void;
};

const areaColors: Record<BodyArea, number> = {
  cabeca: 0x8fc3ff,
  torax: 0x55d6be,
  abdome: 0xffb45f,
  bracos: 0xff7a90,
  pernas: 0x9c8cff,
};

function makePart(area: BodyArea, geometry: THREE.BufferGeometry, position: [number, number, number], scale?: [number, number, number]) {
  const material = new THREE.MeshStandardMaterial({
    color: areaColors[area],
    roughness: 0.42,
    metalness: 0.02,
    transparent: true,
    opacity: 0.86,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  if (scale) mesh.scale.set(...scale);
  mesh.userData.area = area;
  return mesh;
}

export default function HealthMannequin({ selectedArea, onSelectArea }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const selectedRef = useRef(selectedArea);

  useEffect(() => {
    selectedRef.current = selectedArea;
  }, [selectedArea]);

  useEffect(() => {
    const root = mountRef.current;
    if (!root) return;
    const container = root;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 1.2, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    scene.add(new THREE.AmbientLight(0xffffff, 1.25));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x82fff0, 1.4);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    const clickable: THREE.Mesh[] = [];
    const add = (mesh: THREE.Mesh) => {
      clickable.push(mesh);
      group.add(mesh);
      return mesh;
    };

    add(makePart("cabeca", new THREE.SphereGeometry(0.62, 40, 28), [0, 2.75, 0]));
    add(makePart("torax", new THREE.CapsuleGeometry(0.78, 1.35, 18, 32), [0, 1.42, 0], [1.05, 1, 0.72]));
    add(makePart("abdome", new THREE.CapsuleGeometry(0.66, 0.78, 18, 32), [0, 0.35, 0], [1, 0.9, 0.68]));
    add(makePart("bracos", new THREE.CapsuleGeometry(0.2, 1.65, 12, 20), [-1.08, 1.18, 0], [1, 1, 1]));
    add(makePart("bracos", new THREE.CapsuleGeometry(0.2, 1.65, 12, 20), [1.08, 1.18, 0], [1, 1, 1]));
    add(makePart("pernas", new THREE.CapsuleGeometry(0.25, 1.82, 14, 24), [-0.38, -1.25, 0], [1, 1, 1]));
    add(makePart("pernas", new THREE.CapsuleGeometry(0.25, 1.82, 14, 24), [0.38, -1.25, 0], [1, 1, 1]));

    const heart = makePart("torax", new THREE.SphereGeometry(0.18, 24, 18), [-0.24, 1.55, 0.55]);
    heart.scale.set(1, 1.15, 0.82);
    add(heart);
    const lungsLeft = makePart("torax", new THREE.SphereGeometry(0.26, 24, 18), [-0.36, 1.58, 0.42], [0.82, 1.25, 0.62]);
    const lungsRight = makePart("torax", new THREE.SphereGeometry(0.26, 24, 18), [0.36, 1.58, 0.42], [0.82, 1.25, 0.62]);
    add(lungsLeft);
    add(lungsRight);
    add(makePart("abdome", new THREE.SphereGeometry(0.23, 24, 18), [0.28, 0.35, 0.52], [1.35, 0.85, 0.62]));

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function resize() {
      const width = Math.max(container.clientWidth, 320);
      const height = Math.max(container.clientHeight, 420);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function selectFromEvent(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(clickable)[0];
      if (hit?.object.userData.area) onSelectArea(hit.object.userData.area as BodyArea);
    }

    renderer.domElement.addEventListener("pointerdown", selectFromEvent);
    window.addEventListener("resize", resize);
    resize();

    let frame = 0;
    let animationId = 0;
    function animate() {
      frame += 0.01;
      group.rotation.y = Math.sin(frame) * 0.18;
      clickable.forEach((mesh) => {
        const active = mesh.userData.area === selectedRef.current;
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.opacity = active ? 1 : 0.55;
        material.emissive.setHex(active ? 0x143c36 : 0x000000);
      });
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener("pointerdown", selectFromEvent);
      window.removeEventListener("resize", resize);
      clickable.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [onSelectArea]);

  return <div ref={mountRef} className="mannequin" aria-label="Manequim humano 3D interativo" />;
}
