import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const HypnoticQuantumFractal = () => {
  const mountRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [visualMode, setVisualMode] = useState('cosmic');
  const [energyLevel, setEnergyLevel] = useState(75);
  const [dimensionFactor, setDimensionFactor] = useState(1.618);
  const [pulseSpeed, setPulseSpeed] = useState(50);
  const [showControls, setShowControls] = useState(true);
  
  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);
    
    // Add renderer to DOM
    mountRef.current.appendChild(renderer.domElement);
    
    // Create a black background
    const backgroundTexture = new THREE.TextureLoader().load('https://www.solarsystemscope.com/textures/download/2k_stars_milky_way.jpg');
    scene.background = backgroundTexture;
    
    // Setting up groups to manage different elements
    const mainGroup = new THREE.Group();
    const fractalGroup = new THREE.Group();
    const quantumGroup = new THREE.Group();
    const connectionGroup = new THREE.Group();
    
    scene.add(mainGroup);
    mainGroup.add(fractalGroup);
    mainGroup.add(quantumGroup);
    mainGroup.add(connectionGroup);
    
    // Sacred geometry points
    const sacredPoints = [
      { name: "Unity", value: 1.0, color: 0xffcc00 },
      { name: "Golden Ratio", value: 1.618, color: 0xff6600 },
      { name: "Duality", value: 2.0, color: 0x00ccff },
      { name: "Pi", value: Math.PI, color: 0xff00ff },
      { name: "Euler's Number", value: Math.E, color: 0x00ff99 },
    ];
    
    // Problem categories and their colors
    const categories = [
      { name: "Number Theory", color: 0xff4488 },
      { name: "Quantum Physics", color: 0x44ff88 },
      { name: "Topology", color: 0x4488ff },
      { name: "Computation", color: 0xffaa00 },
      { name: "Neuroscience", color: 0xff00ff },
      { name: "Complex Systems", color: 0x9966ff },
    ];
    
    // Create glowing spheres for sacred points
    const createGlowingSphere = (radius, color, intensity = 1.5) => {
      const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
      const sphereMaterial = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.6
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      
      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(radius * 1.2, 32, 32);
      const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color(color) },
          intensity: { value: intensity }
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          uniform float intensity;
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
            gl_FragColor = vec4(glowColor, intensity * 0.6);
          }
        `,
        transparent: true,
        depthWrite: false
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      sphere.add(glow);
      
      return sphere;
    };
    
    // Add sacred points to the scene
    sacredPoints.forEach((point, index) => {
      const sphere = createGlowingSphere(0.2, point.color);
      sphere.userData = { type: 'sacred', pointData: point };
      quantumGroup.add(sphere);
    });
    
    // Create torus knots to represent complex mathematical problems
    categories.forEach((category, index) => {
      const p = 2 + (index % 3);
      const q = 3 + (index % 4);
      const torusGeometry = new THREE.TorusKnotGeometry(
        0.3 + (index % 3) * 0.05,
        0.1,
        64,
        8,
        p,
        q
      );
      const torusMaterial = new THREE.MeshPhongMaterial({
        color: category.color,
        shininess: 100,
        transparent: true,
        opacity: 0.8,
        emissive: new THREE.Color(category.color).multiplyScalar(0.3)
      });
      const torus = new THREE.Mesh(torusGeometry, torusMaterial);
      torus.userData = { type: 'category', categoryData: category };
      fractalGroup.add(torus);
    });

    // Create a central quantum core
    const coreGeometry = new THREE.IcosahedronGeometry(0.5, 2);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 100,
      wireframe: true,
      emissive: 0x111111
    });
    const quantumCore = new THREE.Mesh(coreGeometry, coreMaterial);
    quantumGroup.add(quantumCore);
    
    // Create flowing particles for quantum field
    const particleCount = 2000;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Position particles in a sphere
      const radius = 3 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Assign colors based on position (make it look quantum-y)
      particleColors[i * 3] = 0.5 + 0.5 * Math.sin(theta);
      particleColors[i * 3 + 1] = 0.5 + 0.5 * Math.cos(phi);
      particleColors[i * 3 + 2] = 0.7 + 0.3 * Math.sin(theta + phi);
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    fractalGroup.add(particles);
    
    // Create connection lines between sacred points
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    
    // Create connections
    const updateConnections = () => {
      // Clear old connections
      while (connectionGroup.children.length > 0) {
        connectionGroup.remove(connectionGroup.children[0]);
      }
      
      // Get sacred point positions
      const sacredSpheres = quantumGroup.children.filter(
        obj => obj.userData && obj.userData.type === 'sacred'
      );
      
      // Create lines between each pair
      for (let i = 0; i < sacredSpheres.length; i++) {
        for (let j = i + 1; j < sacredSpheres.length; j++) {
          const lineGeometry = new THREE.BufferGeometry();
          const positions = new Float32Array(6);
          
          // Starting point
          positions[0] = sacredSpheres[i].position.x;
          positions[1] = sacredSpheres[i].position.y;
          positions[2] = sacredSpheres[i].position.z;
          
          // Ending point
          positions[3] = sacredSpheres[j].position.x;
          positions[4] = sacredSpheres[j].position.y;
          positions[5] = sacredSpheres[j].position.z;
          
          lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          
          const line = new THREE.Line(lineGeometry, lineMaterial);
          connectionGroup.add(line);
        }
      }
    };
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Add point lights with different colors
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    colors.forEach((color, i) => {
      const light = new THREE.PointLight(color, 1, 10);
      const angle = (i / colors.length) * Math.PI * 2;
      light.position.set(
        Math.cos(angle) * 5,
        Math.sin(angle) * 5,
        2
      );
      scene.add(light);
    });
    
    // Animation variables
    let time = 0;
    const animate = () => {
      if (isPlaying) {
        time += 0.005 * (pulseSpeed / 50);
        
        // Set camera based on mouse position
        camera.lookAt(scene.position);
        
        // Update quantum core
        if (quantumCore) {
          quantumCore.rotation.x = time * 0.5;
          quantumCore.rotation.y = time * 0.3;
          quantumCore.rotation.z = time * 0.2;
          
          // Pulse the core
          const scaleFactor = 1 + 0.1 * Math.sin(time * 3);
          quantumCore.scale.set(scaleFactor, scaleFactor, scaleFactor);
          
          // Change core color
          const hue = (time * 0.1) % 1;
          coreMaterial.emissive.setHSL(hue, 1, 0.5 * (energyLevel / 100));
        }
        
        // Rotate the main groups
        fractalGroup.rotation.y = time * 0.2;
        fractalGroup.rotation.z = time * 0.1;
        
        quantumGroup.rotation.y = -time * 0.15;
        quantumGroup.rotation.x = Math.sin(time * 0.2) * 0.3;
        
        // Update sacred point positions
        const sacredSpheres = quantumGroup.children.filter(
          obj => obj.userData && obj.userData.type === 'sacred'
        );
        
        sacredSpheres.forEach((sphere, i) => {
          const point = sphere.userData.pointData;
          const radius = 2 + Math.sin(time * 0.3 + i) * 0.5;
          const speedFactor = 0.8 / point.value;
          const angle = time * speedFactor;
          
          // Orbit position
          sphere.position.x = Math.cos(angle + i) * radius * Math.sin(time * 0.1 + i);
          sphere.position.y = Math.sin(angle + i * 2) * radius * 0.5;
          sphere.position.z = Math.sin(angle + i) * radius * Math.cos(time * 0.1 + i);
          
          // Pulse effect
          const pulseFactor = 1 + 0.2 * Math.sin(time * 3 + i * 2);
          sphere.scale.set(pulseFactor, pulseFactor, pulseFactor);
          
          // Update glow intensity based on energy level
          if (sphere.children[0] && sphere.children[0].material) {
            sphere.children[0].material.uniforms.intensity.value = 
              1.5 + Math.sin(time * 2 + i) * 0.5 * (energyLevel / 100);
          }
        });
        
        // Update category torus knots
        const torusKnots = fractalGroup.children.filter(
          obj => obj.userData && obj.userData.type === 'category'
        );
        
        torusKnots.forEach((torus, i) => {
          torus.rotation.x = time * (0.3 + i * 0.05);
          torus.rotation.y = time * (0.2 + i * 0.03);
          
          // Orbit position
          const radius = 2.5;
          const angle = (i / torusKnots.length) * Math.PI * 2 + time * 0.1;
          torus.position.x = Math.cos(angle) * radius;
          torus.position.y = Math.sin(angle) * radius * 0.5;
          torus.position.z = Math.sin(angle * 2) * radius * 0.3;
          
          // Modulate opacity based on energy
          torus.material.opacity = 0.5 + 0.5 * (energyLevel / 100);
        });
        
        // Update quantum particles
        const positions = particles.geometry.attributes.position.array;
        const colors = particles.geometry.attributes.color.array;
        
        for (let i = 0; i < particleCount; i++) {
          // Create flowing particle effect
          const idx = i * 3;
          const x = positions[idx];
          const y = positions[idx + 1];
          const z = positions[idx + 2];
          
          const distance = Math.sqrt(x*x + y*y + z*z);
          const normFactor = 3 / distance;
          
          // Move particles in a flow pattern
          positions[idx] += Math.sin(time + x * 0.5) * 0.01 * (pulseSpeed / 50);
          positions[idx + 1] += Math.cos(time + y * 0.5) * 0.01 * (pulseSpeed / 50);
          positions[idx + 2] += Math.sin(time * 0.7 + z * 0.5) * 0.01 * (pulseSpeed / 50);
          
          // Pull particles that get too far back toward the center
          if (distance > 5) {
            positions[idx] -= (x - x * normFactor) * 0.02;
            positions[idx + 1] -= (y - y * normFactor) * 0.02;
            positions[idx + 2] -= (z - z * normFactor) * 0.02;
          }
          
          // Update colors for flowing effect
          colors[idx] = 0.5 + 0.5 * Math.sin(time + i * 0.1);
          colors[idx + 1] = 0.5 + 0.5 * Math.cos(time * 0.7 + i * 0.1);
          colors[idx + 2] = 0.5 + 0.5 * Math.sin(time * 0.5 + i * 0.1);
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.color.needsUpdate = true;
        
        // Update connections between sacred points
        updateConnections();
        
        // Apply fractal dimension factor to overall scale
        const dimensionEffect = Math.pow(Math.sin(time * 0.2) * 0.5 + 0.5, dimensionFactor - 1);
        mainGroup.scale.set(
          1 + dimensionEffect * 0.2,
          1 + dimensionEffect * 0.2,
          1 + dimensionEffect * 0.2
        );
        
        // Apply visual mode effects
        switch (visualMode) {
          case 'cosmic':
            // Default state
            scene.background = backgroundTexture;
            break;
          case 'fractal':
            // Intense fractal mode, more wireframe and geometry
            scene.background.mapping = THREE.EquirectangularReflectionMapping;
            break;
          case 'quantum':
            // More particles, glowing effects
            particles.material.size = 0.05 + 0.03 * Math.sin(time);
            particles.material.opacity = 0.7 + 0.3 * Math.sin(time * 2);
            break;
          default:
            break;
        }
      }
      
      // Render
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // Tilt camera based on mouse position (subtle effect)
      camera.position.x = mouse.x * 0.5;
      camera.position.y = mouse.y * 0.5;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [isPlaying, visualMode, energyLevel, dimensionFactor, pulseSpeed]);
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Mount point for Three.js */}
      <div ref={mountRef} className="absolute inset-0" />
      
      {/* Controls overlay */}
      <div className="absolute z-10 w-full">
        <div className="flex justify-end p-4">
          <button 
            onClick={() => setShowControls(!showControls)}
            className="bg-black bg-opacity-50 text-white p-2 rounded-full"
          >
            {showControls ? '×' : '⚙️'}
          </button>
        </div>
        
        {showControls && (
          <div className="absolute right-0 top-16 w-64 bg-black bg-opacity-70 p-4 rounded-l-xl text-white">
            <h3 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Quantum Control Panel
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <label>Visual Mode</label>
                  <span className="text-sm opacity-70">{visualMode}</span>
                </div>
                <div className="flex space-x-2 mt-1">
                  <button 
                    onClick={() => setVisualMode('cosmic')}
                    className={`px-2 py-1 rounded-md text-xs flex-1 ${visualMode === 'cosmic' ? 'bg-purple-600' : 'bg-gray-700'}`}
                  >
                    Cosmic
                  </button>
                  <button 
                    onClick={() => setVisualMode('fractal')}
                    className={`px-2 py-1 rounded-md text-xs flex-1 ${visualMode === 'fractal' ? 'bg-purple-600' : 'bg-gray-700'}`}
                  >
                    Fractal
                  </button>
                  <button 
                    onClick={() => setVisualMode('quantum')}
                    className={`px-2 py-1 rounded-md text-xs flex-1 ${visualMode === 'quantum' ? 'bg-purple-600' : 'bg-gray-700'}`}
                  >
                    Quantum
                  </button>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between">
                  <label>Energy Level</label>
                  <span className="text-sm opacity-70">{energyLevel}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <div className="flex justify-between">
                  <label>Fractal Dimension</label>
                  <span className="text-sm opacity-70">{dimensionFactor.toFixed(3)}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3.14159" 
                  step="0.001"
                  value={dimensionFactor}
                  onChange={(e) => setDimensionFactor(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs mt-1 opacity-50">
                  <span>Unity</span>
                  <span>φ</span>
                  <span>Duality</span>
                  <span>π</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between">
                  <label>Pulse Speed</label>
                  <span className="text-sm opacity-70">{pulseSpeed}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={pulseSpeed}
                  onChange={(e) => setPulseSpeed(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="pt-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-full py-2 rounded-lg font-medium ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} transition-colors`}
                >
                  {isPlaying ? 'Pause Experience' : 'Resume Experience'}
                </button>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-blue-900 bg-opacity-30 rounded-lg text-xs">
              <p className="mb-2 font-semibold">Visualization Guide:</p>
              <ul className="space-y-1 opacity-80">
                <li>• <span className="text-yellow-300">Yellow orb</span>: Unity (1.0)</li>
                <li>• <span className="text-orange-400">Orange orb</span>: Golden Ratio (1.618)</li>
                <li>• <span className="text-blue-300">Blue orb</span>: Duality (2.0)</li>
                <li>• <span className="text-pink-400">Pink orb</span>: Pi (3.14159)</li>
                <li>• <span className="text-green-300">Green orb</span>: Euler's Number (e)</li>
              </ul>
              <p className="mt-2 opacity-60">Move your mouse to control the camera angle</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Title overlay */}
      <div className="absolute bottom-0 left-0 p-6 pointer-events-none">
        <h1 className="text-4xl font-bold text-white opacity-80 tracking-wider">
          QUANTUM
          <span className="block text-5xl font-light bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            FRACTAL MIND
          </span>
        </h1>
      </div>
    </div>
  );
};

export default HypnoticQuantumFractal;