import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { engine, createTimeline, utils } from 'animejs';

const WireframeCubes = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevents Anime.js from using its own loop
    engine.useDefaultMainLoop = false;

    const { width, height } = container.getBoundingClientRect();

    // Three.js setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 20);
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    // Blue-purple gradient palette
    const colorA = new THREE.Color('#3b82f6'); // blue
    const colorB = new THREE.Color('#8b5cf6'); // purple

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    camera.position.z = 5;
    rendererRef.current = renderer;

    function createAnimatedCube() {
      const t = Math.random();
      const cubeColor = colorA.clone().lerp(colorB.clone(), t);
      const mat = new THREE.MeshBasicMaterial({
        color: cubeColor,
        wireframe: true,
        transparent: true,
        opacity: 0.3 + t * 0.2,
      });
      const cube = new THREE.Mesh(geometry, mat);
      const x = utils.random(-10, 10, 2);
      const y = utils.random(-5, 5, 2);
      const z = [-10, 7];
      const r = () => utils.random(-Math.PI * 2, Math.PI * 2, 3);
      const duration = 4000;
      createTimeline({
        delay: utils.random(0, duration),
        defaults: { loop: true, duration, ease: 'inSine' },
      })
      .add(cube.position, { x, y, z }, 0)
      .add(cube.rotation, { x: r, y: r, z: r }, 0)
      .init();
      scene.add(cube);
    }

    for (let i = 0; i < 40; i++) {
      createAnimatedCube();
    }

    function render() {
      engine.update();
      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(render);

    // Handle resize
    const handleResize = () => {
      const { width: w, height: h } = container.getBoundingClientRect();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.setAnimationLoop(null);
      renderer.dispose();
      geometry.dispose();
      scene.traverse((obj) => { if (obj.isMesh) obj.material.dispose(); });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="glass-panel overflow-hidden relative"
      style={{ 
        backgroundColor: '#1a1c23', 
        borderColor: 'rgba(255,255,255,0.05)',
        height: '320px',
      }}
    >
    </div>
  );
};

export default WireframeCubes;
