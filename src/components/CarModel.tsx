"use client";

import { RoundedBox } from "@react-three/drei";
import type { CarId } from "@/lib/cars";

type WheelProps = { position: [number, number, number] };

function Wheel({ position }: WheelProps) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      {/* タイヤ */}
      <mesh castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.26, 32]} />
        <meshStandardMaterial color="#0a0c12" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* ホイール（リム） */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 24]} />
        <meshStandardMaterial color="#d7dde7" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.142, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
        <meshStandardMaterial color="#9aa3b2" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

const WHEELS: [number, number, number][] = [
  [0.86, 0.34, 1.12],
  [-0.86, 0.34, 1.12],
  [0.86, 0.34, -1.12],
  [-0.86, 0.34, -1.12],
];

/** ダイハツ コペン — 低く構えた2シーター・オープンロードスター */
function CopenModel({ accent }: { accent: string }) {
  return (
    <group>
      {/* メインボディ */}
      <RoundedBox args={[1.66, 0.52, 3.5]} radius={0.2} smoothness={6} position={[0, 0.55, 0]} castShadow>
        <meshStandardMaterial color={accent} metalness={0.7} roughness={0.28} />
      </RoundedBox>
      {/* ボンネット（前方を少し低く） */}
      <RoundedBox args={[1.5, 0.34, 1.2]} radius={0.16} smoothness={5} position={[0, 0.62, 1.18]}>
        <meshStandardMaterial color={accent} metalness={0.7} roughness={0.28} />
      </RoundedBox>
      {/* リアデッキ */}
      <RoundedBox args={[1.56, 0.4, 1.0]} radius={0.16} smoothness={5} position={[0, 0.66, -1.2]}>
        <meshStandardMaterial color={accent} metalness={0.7} roughness={0.28} />
      </RoundedBox>
      {/* コックピット（オープントップの凹み） */}
      <RoundedBox args={[1.24, 0.34, 1.5]} radius={0.12} smoothness={5} position={[0, 0.82, -0.15]}>
        <meshStandardMaterial color="#10131a" metalness={0.3} roughness={0.7} />
      </RoundedBox>
      {/* シート×2 */}
      {[0.34, -0.34].map((x) => (
        <group key={x} position={[x, 0.92, -0.45]}>
          <RoundedBox args={[0.42, 0.12, 0.42]} radius={0.06} smoothness={4}>
            <meshStandardMaterial color="#1d2230" roughness={0.8} />
          </RoundedBox>
          <RoundedBox args={[0.42, 0.5, 0.12]} radius={0.06} smoothness={4} position={[0, 0.28, -0.2]}>
            <meshStandardMaterial color="#1d2230" roughness={0.8} />
          </RoundedBox>
        </group>
      ))}
      {/* ウィンドシールド */}
      <mesh position={[0, 1.0, 0.55]} rotation={[-Math.PI / 6, 0, 0]}>
        <boxGeometry args={[1.16, 0.42, 0.03]} />
        <meshStandardMaterial color="#9fd8ff" transparent opacity={0.32} metalness={0.2} roughness={0.05} />
      </mesh>
      {/* ヘッドライト */}
      {[0.5, -0.5].map((x) => (
        <mesh key={x} position={[x, 0.6, 1.78]}>
          <sphereGeometry args={[0.14, 18, 18]} />
          <meshStandardMaterial color="#fff4d6" emissive="#ffd27a" emissiveIntensity={1.6} />
        </mesh>
      ))}
      {/* テールランプ */}
      {[0.55, -0.55].map((x) => (
        <mesh key={x} position={[x, 0.66, -1.74]}>
          <boxGeometry args={[0.3, 0.12, 0.06]} />
          <meshStandardMaterial color="#ff3b30" emissive="#ff2a20" emissiveIntensity={1.3} />
        </mesh>
      ))}
      {WHEELS.map((p, i) => (
        <Wheel key={i} position={p} />
      ))}
    </group>
  );
}

/** ホンダ バモス — 背の高いキャブオーバー・ワンボックス */
function VamosModel({ accent }: { accent: string }) {
  return (
    <group>
      {/* メインボディ（ボックス） */}
      <RoundedBox args={[1.62, 1.5, 3.3]} radius={0.18} smoothness={6} position={[0, 0.98, 0]} castShadow>
        <meshStandardMaterial color="#e9edf2" metalness={0.5} roughness={0.35} />
      </RoundedBox>
      {/* アクセントの腰ライン */}
      <RoundedBox args={[1.64, 0.16, 3.28]} radius={0.06} smoothness={4} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={accent} metalness={0.6} roughness={0.3} />
      </RoundedBox>
      {/* グリーンハウス（窓帯） */}
      <RoundedBox args={[1.5, 0.62, 2.0]} radius={0.1} smoothness={5} position={[0, 1.35, -0.15]}>
        <meshStandardMaterial color="#0e1420" metalness={0.25} roughness={0.15} />
      </RoundedBox>
      {/* フロントウィンドウ */}
      <mesh position={[0, 1.35, 1.5]} rotation={[-Math.PI / 14, 0, 0]}>
        <boxGeometry args={[1.46, 0.66, 0.04]} />
        <meshStandardMaterial color="#9fd8ff" transparent opacity={0.34} metalness={0.2} roughness={0.05} />
      </mesh>
      {/* サイドのスライドドア境界線 */}
      {[0.82, -0.82].map((x) => (
        <mesh key={x} position={[x, 0.95, 0.05]}>
          <boxGeometry args={[0.02, 1.3, 0.04]} />
          <meshStandardMaterial color="#aab2bf" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      {/* ヘッドライト */}
      {[0.55, -0.55].map((x) => (
        <mesh key={x} position={[x, 0.62, 1.66]}>
          <boxGeometry args={[0.28, 0.2, 0.06]} />
          <meshStandardMaterial color="#fff4d6" emissive="#ffd27a" emissiveIntensity={1.5} />
        </mesh>
      ))}
      {/* テールランプ */}
      {[0.6, -0.6].map((x) => (
        <mesh key={x} position={[x, 1.1, -1.66]}>
          <boxGeometry args={[0.22, 0.5, 0.06]} />
          <meshStandardMaterial color="#ff3b30" emissive="#ff2a20" emissiveIntensity={1.2} />
        </mesh>
      ))}
      {WHEELS.map((p, i) => (
        <Wheel key={i} position={p} />
      ))}
    </group>
  );
}

export function CarModel({ carId, accent }: { carId: CarId; accent: string }) {
  return carId === "copen" ? <CopenModel accent={accent} /> : <VamosModel accent={accent} />;
}
