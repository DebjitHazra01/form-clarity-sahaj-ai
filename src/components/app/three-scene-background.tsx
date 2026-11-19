'use client';

import React, { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Particle3D extends Point3D {
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
}

interface DocumentMesh3D {
  center: Point3D;
  vertices: Point3D[];
  edges: [number, number][];
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  color: string;
  fillColor: string;
  label: string;
}

export function ThreeSceneBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) / (width / 2);
      targetMouseY = (e.clientY - height / 2) / (height / 2);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Civic AI color palette: Emerald, Teal, Azure, Saffron, White
    const colors = [
      'rgba(20, 184, 166, 0.65)', // Teal
      'rgba(59, 130, 246, 0.65)', // Azure AI
      'rgba(16, 185, 129, 0.65)', // Emerald Verified
      'rgba(245, 158, 11, 0.55)', // Saffron / Gold
      'rgba(255, 255, 255, 0.6)',  // Starlight White
    ];

    // Create 3D particles
    const particleCount = 90;
    const particles: Particle3D[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.6,
        y: (Math.random() - 0.5) * height * 1.6,
        z: Math.random() * 800 + 150,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 2.2 + 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Floating 3D Government Document Sheets in space
    const documentMeshes: DocumentMesh3D[] = [];

    const createDocSheet = (
      cx: number,
      cy: number,
      cz: number,
      w: number,
      h: number,
      color: string,
      fillColor: string,
      label: string
    ): DocumentMesh3D => {
      const hw = w / 2;
      const hh = h / 2;
      const d = 10;
      const hd = d / 2;

      const vertices: Point3D[] = [
        { x: -hw, y: -hh, z: -hd },
        { x: hw, y: -hh, z: -hd },
        { x: hw, y: hh, z: -hd },
        { x: -hw, y: hh, z: -hd },
        { x: -hw, y: -hh, z: hd },
        { x: hw, y: -hh, z: hd },
        { x: hw, y: hh, z: hd },
        { x: -hw, y: hh, z: hd },
      ];

      const edges: [number, number][] = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];

      return {
        center: { x: cx, y: cy, z: cz },
        vertices,
        edges,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        vRotX: (Math.random() - 0.5) * 0.007,
        vRotY: (Math.random() - 0.5) * 0.007,
        vRotZ: (Math.random() - 0.5) * 0.007,
        color,
        fillColor,
        label,
      };
    };

    // 4 Thematic Floating Documents: Form, Aadhaar, PAN, Filled Application
    documentMeshes.push(
      createDocSheet(-width * 0.38, -height * 0.28, 480, 85, 120, 'rgba(20, 184, 166, 0.75)', 'rgba(20, 184, 166, 0.06)', 'FORM 49A')
    );
    documentMeshes.push(
      createDocSheet(width * 0.38, -height * 0.25, 520, 100, 65, 'rgba(245, 158, 11, 0.75)', 'rgba(245, 158, 11, 0.06)', 'AADHAAR')
    );
    documentMeshes.push(
      createDocSheet(-width * 0.36, height * 0.3, 490, 95, 60, 'rgba(59, 130, 246, 0.75)', 'rgba(59, 130, 246, 0.06)', 'PAN CARD')
    );
    documentMeshes.push(
      createDocSheet(width * 0.35, height * 0.32, 510, 85, 120, 'rgba(16, 185, 129, 0.75)', 'rgba(16, 185, 129, 0.06)', 'FILLED DOC')
    );

    const fov = 650;
    const project = (p: Point3D): { x: number; y: number; scale: number } => {
      const scale = fov / (fov + p.z);
      return {
        x: p.x * scale + width / 2,
        y: p.y * scale + height / 2,
        scale,
      };
    };

    const rotateVertex = (v: Point3D, rx: number, ry: number, rz: number): Point3D => {
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      let x1 = v.x * cosY + v.z * sinY;
      let y1 = v.y;
      let z1 = -v.x * sinY + v.z * cosY;

      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      let x2 = x1;
      let y2 = y1 * cosX - z1 * sinX;
      let z2 = y1 * sinX + z1 * cosX;

      const cosZ = Math.cos(rz);
      const sinZ = Math.sin(rz);
      let x3 = x2 * cosZ - y2 * sinZ;
      let y3 = x2 * sinZ + y2 * cosZ;
      let z3 = z2;

      return { x: x3, y: y3, z: z3 };
    };

    let tick = 0;

    const render = () => {
      tick += 1;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 1. Ambient 3D Volumetric Orbs (Saffron, Teal, Azure, Emerald)
      const orb1X = width * 0.15 + mouseX * 45;
      const orb1Y = height * 0.18 + mouseY * 45 + Math.sin(tick * 0.015) * 18;
      const radGrad1 = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, 360);
      radGrad1.addColorStop(0, 'rgba(20, 184, 166, 0.22)');
      radGrad1.addColorStop(1, 'rgba(20, 184, 166, 0)');
      ctx.fillStyle = radGrad1;
      ctx.beginPath();
      ctx.arc(orb1X, orb1Y, 360, 0, Math.PI * 2);
      ctx.fill();

      const orb2X = width * 0.85 - mouseX * 45;
      const orb2Y = height * 0.25 - mouseY * 45 + Math.cos(tick * 0.012) * 22;
      const radGrad2 = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, 380);
      radGrad2.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
      radGrad2.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = radGrad2;
      ctx.beginPath();
      ctx.arc(orb2X, orb2Y, 380, 0, Math.PI * 2);
      ctx.fill();

      const orb3X = width * 0.5 + mouseX * 30;
      const orb3Y = height * 0.8 + mouseY * 30 + Math.sin(tick * 0.018) * 20;
      const radGrad3 = ctx.createRadialGradient(orb3X, orb3Y, 10, orb3X, orb3Y, 400);
      radGrad3.addColorStop(0, 'rgba(59, 130, 246, 0.18)');
      radGrad3.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = radGrad3;
      ctx.beginPath();
      ctx.arc(orb3X, orb3Y, 400, 0, Math.PI * 2);
      ctx.fill();

      // 2. Render 3D Document Prisms
      documentMeshes.forEach(mesh => {
        mesh.rotX += mesh.vRotX;
        mesh.rotY += mesh.vRotY;
        mesh.rotZ += mesh.vRotZ;

        const camX = mesh.center.x + mouseX * 55;
        const camY = mesh.center.y + mouseY * 55 + Math.sin(tick * 0.02 + mesh.center.x) * 14;
        const camZ = mesh.center.z;

        const rotatedVertices = mesh.vertices.map(v => {
          const rot = rotateVertex(v, mesh.rotX, mesh.rotY, mesh.rotZ);
          return {
            x: rot.x + camX,
            y: rot.y + camY,
            z: rot.z + camZ,
          };
        });

        const projected = rotatedVertices.map(v => project(v));

        // Draw translucent document faces
        ctx.fillStyle = mesh.fillColor;
        ctx.beginPath();
        ctx.moveTo(projected[0].x, projected[0].y);
        ctx.lineTo(projected[1].x, projected[1].y);
        ctx.lineTo(projected[2].x, projected[2].y);
        ctx.lineTo(projected[3].x, projected[3].y);
        ctx.closePath();
        ctx.fill();

        // Draw borders
        ctx.strokeStyle = mesh.color;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = mesh.color;
        ctx.shadowBlur = 8;

        mesh.edges.forEach(([i, j]) => {
          const p1 = projected[i];
          const p2 = projected[j];
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        });

        // Glowing corner nodes
        ctx.fillStyle = '#ffffff';
        projected.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.0 * p.scale, 0, Math.PI * 2);
          ctx.fill();
        });

        // Center holographic label
        const centerProjected = project({ x: camX, y: camY, z: camZ });
        ctx.fillStyle = mesh.color;
        ctx.font = `${Math.max(9, Math.round(11 * centerProjected.scale))}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(mesh.label, centerProjected.x, centerProjected.y);

        ctx.shadowBlur = 0;
      });

      // 3. Render 3D Neural Constellation Particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.x < -width) p.x = width;
        if (p.x > width) p.x = -width;
        if (p.y < -height) p.y = height;
        if (p.y > height) p.y = -height;
        if (p.z < 100) p.z = 900;
        if (p.z > 900) p.z = 100;

        const screenP = project({
          x: p.x + mouseX * 70,
          y: p.y + mouseY * 70,
          z: p.z,
        });

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(screenP.x, screenP.y, p.size * screenP.scale, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby points with distance lines
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dz = p.z - p2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 135) {
            const p2Screen = project({
              x: p2.x + mouseX * 70,
              y: p2.y + mouseY * 70,
              z: p2.z,
            });
            const alpha = (1 - dist / 135) * 0.22;
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = 0.75 * screenP.scale;
            ctx.beginPath();
            ctx.moveTo(screenP.x, screenP.y);
            ctx.lineTo(p2Screen.x, p2Screen.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90"
    />
  );
}
