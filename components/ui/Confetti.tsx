import React, { useEffect, useState } from "react";

interface ConfettiProps {
  show: boolean;
  onComplete: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ show, onComplete }) => {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
    }>
  >([]);

  useEffect(() => {
    if (!show) return;

    const colors = [
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4",
    ];
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -10,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * 5 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
    }));

    setParticles(newParticles);

    const animateParticles = () => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.3, // gravity
          }))
          .filter((particle) => particle.y < window.innerHeight + 50)
      );
    };

    const interval = setInterval(animateParticles, 16);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setParticles([]);
      onComplete();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [show, onComplete]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: `rotate(${particle.x * 0.1}deg)`,
          }}
        />
      ))}
    </div>
  );
};
