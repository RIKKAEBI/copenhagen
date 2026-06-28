"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import type { Group } from "three";
import { CarModel } from "./CarModel";
import type { CarId } from "@/lib/cars";

function Turntable({ carId, accent }: { carId: CarId; accent: string }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    // ゆっくり上下に浮遊
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
  });
  return (
    <group ref={ref}>
      <CarModel carId={carId} accent={accent} />
    </group>
  );
}

function HudRing({ accent }: { accent: string }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.25;
  });
  return (
    <group ref={ref}>
      {/* 発光リング */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <torusGeometry args={[2.5, 0.015, 12, 96]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      {/* リング上のティック */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.5, 0.02, Math.sin(a) * 2.5]} rotation={[-Math.PI / 2, 0, -a]}>
            <boxGeometry args={[0.02, 0.16, 0.01]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

function Platform({ accent }: { accent: string }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.2, 0.08, 64]} />
        <meshStandardMaterial color="#0b0f17" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[2.9, 3.05, 64]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} toneMapped={false} side={2} />
      </mesh>
    </group>
  );
}

export default function CarShowcase({ carId, accent }: { carId: CarId; accent: string }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [4.6, 2.8, 5.4], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#05070d"]} />
      <fog attach="fog" args={["#05070d", 9, 20]} />

      {/* ライティング（ハンガー風） */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 9, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-6, 6, -4]} angle={0.5} penumbra={0.8} intensity={1.2} color={accent} />
      <pointLight position={[0, 1.5, 4]} intensity={0.6} color="#9fd8ff" />

      <Suspense fallback={null}>
        <Turntable carId={carId} accent={accent} />
        <Platform accent={accent} />
        <HudRing accent={accent} />
        <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={9} blur={2.4} far={4} resolution={512} color="#000000" />
      </Suspense>

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.9}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.7, 0]}
      />
    </Canvas>
  );
}
