// celestialBodies.js - Solar system data and creation functions

import * as THREE from 'three';

// Celestial body data with properties for the solar system
export const celestialBodiesData = {
    sun: { name: 'Sun', radius: 5, color: 0xFFFF00 /* texture: 'textures/sun.jpg' */ },
    mercury: { name: 'Mercury', radius: 0.4, distance: 10, period: 0.24, color: 0x8C8C8C /* texture: 'textures/mercury.jpg' */ },
    venus: { name: 'Venus', radius: 0.9, distance: 15, period: 0.62, color: 0xE6E6FA /* texture: 'textures/venus.jpg' */ },
    earth: {
        name: 'Earth', radius: 1, distance: 20, period: 1, color: 0x4682B4 /* texture: 'textures/earth.jpg' */,
        moons: [
            { name: 'Moon', radius: 0.27, distance: 2, period: 0.074, color: 0xD3D3D3 /* texture: 'textures/moon.jpg' */ }
        ]
    },
    mars: {
        name: 'Mars', radius: 0.5, distance: 28, period: 1.88, color: 0xFF4500 /* texture: 'textures/mars.jpg' */,
        moons: [
            { name: 'Phobos', radius: 0.01, distance: 1, period: 0.002, color: 0x808080 },
            { name: 'Deimos', radius: 0.006, distance: 1.5, period: 0.003, color: 0x808080 }
        ]
    },
    jupiter: {
        name: 'Jupiter', radius: 3.5, distance: 45, period: 11.86, color: 0xFFD700 /* texture: 'textures/jupiter.jpg' */,
        moons: [
            { name: 'Io', radius: 0.36, distance: 5, period: 0.004, color: 0xFFFFE0 },
            { name: 'Europa', radius: 0.31, distance: 6, period: 0.009, color: 0xF5F5DC },
            { name: 'Ganymede', radius: 0.52, distance: 7.5, period: 0.019, color: 0xA0522D },
            { name: 'Callisto', radius: 0.48, distance: 9, period: 0.045, color: 0x696969 }
        ]
    },
    saturn: {
        name: 'Saturn', radius: 3, distance: 65, period: 29.46, color: 0xF0E68C /* texture: 'textures/saturn.jpg' */,
        moons: [
            { name: 'Titan', radius: 0.51, distance: 5, period: 0.043, color: 0xFFA500 }
            // Add other major moons if desired (Rhea, Iapetus, Dione, Tethys)
        ],
        rings: { innerRadius: 3.5, outerRadius: 6, color: 0xAAAAAA /* texture: 'textures/saturn_ring.png' */ }
    },
    uranus: {
        name: 'Uranus', radius: 2, distance: 85, period: 84.01, color: 0xAFEEEE /* texture: 'textures/uranus.jpg' */,
        moons: [
            { name: 'Titania', radius: 0.15, distance: 3, period: 0.023, color: 0xD3D3D3 }
            // Add other major moons if desired (Oberon, Umbriel, Ariel, Miranda)
        ],
         rings: { innerRadius: 2.5, outerRadius: 3, color: 0x999999 } // Simplified rings
    },
    neptune: {
        name: 'Neptune', radius: 1.9, distance: 100, period: 164.8, color: 0x4169E1 /* texture: 'textures/neptune.jpg' */,
        moons: [
            { name: 'Triton', radius: 0.27, distance: 3.5, period: 0.016, color: 0xFFE4B5 }
        ]
    },
    pluto: { name: 'Pluto', radius: 0.18, distance: 115, period: 248, color: 0xF5DEB3 /* texture: 'textures/pluto.jpg' */,
        moons: [
             { name: 'Charon', radius: 0.09, distance: 0.8, period: 0.017, color: 0x8B4513 }
        ]
     }
};

// Function to create a celestial body mesh
export function createCelestialBody(data) {
    const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
    let material;
    if (data.name === 'Sun') {
        // Sun should glow, use BasicMaterial
        material = new THREE.MeshBasicMaterial({ color: data.color });
        // Or potentially use an emissive StandardMaterial if textures are added later
        // material = new THREE.MeshStandardMaterial({ emissive: data.color, emissiveIntensity: 1 });
    } else {
        // Planets and moons react to light
        material = new THREE.MeshStandardMaterial({
            color: data.color,
            roughness: 0.9, // Less shiny
            metalness: 0.1
        });
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = data.name;
    return mesh;
}

// Function to create a ring
export function createRing(data) {
    const geometry = new THREE.RingGeometry(data.innerRadius, data.outerRadius, 64);
    const material = new THREE.MeshStandardMaterial({
        color: data.color,
        side: THREE.DoubleSide,
        roughness: 0.9,
        metalness: 0.1
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = data.name + " Ring";
    mesh.rotation.x = Math.PI / 2;
    return mesh;
}

// Function to create orbit path visualization
export function createOrbitPath(radius, segments = 128) {
    const geometry = new THREE.BufferGeometry().setFromPoints(
        new THREE.Path().absarc(0, 0, radius, 0, Math.PI * 2, true).getPoints(segments)
    );
    const material = new THREE.LineBasicMaterial({ 
        color: 0x444444,
        transparent: true,
        opacity: 0.3,
        linewidth: 1 
    });
    return new THREE.Line(geometry, material);
}

// Create all solar system objects and add to scene
export function createSolarSystem(scene) {
    const solarSystemObjects = {
        sun: null,
        planets: [] // Will store { pivot: Object3D, mesh: Mesh, data: object, moons: [{ pivot: Object3D, mesh: Mesh, data: object }] }
    };

    // 1. Create Sun
    solarSystemObjects.sun = createCelestialBody(celestialBodiesData.sun);
    scene.add(solarSystemObjects.sun);

    // 2. Create Planets and Moons
    for (const planetKey in celestialBodiesData) {
        if (planetKey === 'sun') continue; // Skip sun, already created

        const planetData = celestialBodiesData[planetKey];

        // Create planet orbit pivot (orbits around the sun at 0,0,0)
        const planetOrbitPivot = new THREE.Object3D();
        scene.add(planetOrbitPivot);

        // Create planet mesh
        const planetMesh = createCelestialBody(planetData);
        planetMesh.position.x = planetData.distance; // Position relative to pivot
        planetOrbitPivot.add(planetMesh); // Add planet to its orbit pivot

        const planetInfo = {
            pivot: planetOrbitPivot,
            mesh: planetMesh,
            data: planetData,
            moons: []
        };

        // Add Rings if they exist
        if (planetData.rings) {
            const ringMesh = createRing(planetData.rings);
            // Tilt rings slightly (e.g., Saturn) - adjust as needed
            if (planetData.name === 'Saturn') {
                ringMesh.rotation.y = 0.1; // Example tilt
            } else if (planetData.name === 'Uranus') {
                // Uranus has significant axial tilt affecting ring plane view
                ringMesh.rotation.y = Math.PI / 2;
            }
            planetMesh.add(ringMesh); // Add rings as child of the planet mesh
        }

        // Create Moons for this planet
        if (planetData.moons) {
            planetData.moons.forEach(moonData => {
                // Create moon orbit pivot (orbits around the planet)
                const moonOrbitPivot = new THREE.Object3D();
                planetMesh.add(moonOrbitPivot); // Add moon pivot to the PLANET MESH

                // Create moon mesh
                const moonMesh = createCelestialBody(moonData);
                moonMesh.position.x = moonData.distance; // Position relative to moon pivot
                moonOrbitPivot.add(moonMesh); // Add moon mesh to its pivot

                planetInfo.moons.push({
                    pivot: moonOrbitPivot,
                    mesh: moonMesh,
                    data: moonData
                });
            });
        }

        // Add orbit path visualization
        const orbitPath = createOrbitPath(planetData.distance);
        orbitPath.rotation.x = Math.PI / 2; // Rotate to match the XZ plane
        scene.add(orbitPath);

        solarSystemObjects.planets.push(planetInfo);
    }

    console.log("Solar system objects created:", solarSystemObjects);
    return solarSystemObjects;
}

// Function to animate the solar system
export function animateSolarSystem(solarSystemObjects, elapsedTime, timeScale) {
    // Animate planets around the sun
    solarSystemObjects.planets.forEach(planetInfo => {
        if (planetInfo.data.period > 0) { // Avoid division by zero if period is missing
            const angle = (elapsedTime * timeScale / planetInfo.data.period) * 2 * Math.PI;
            planetInfo.pivot.rotation.y = angle;
        }

        // Animate moons around their planet
        planetInfo.moons.forEach(moonInfo => {
            if (moonInfo.data.period > 0) {
                const moonAngle = (elapsedTime * timeScale / moonInfo.data.period) * 2 * Math.PI * 10; // Moons orbit faster relative to planets typically, scale up
                moonInfo.pivot.rotation.y = moonAngle;
            }
            // Add moon self-rotation
            moonInfo.mesh.rotation.y += 0.01;
        });

        // Add planet self-rotation (axial spin)
        planetInfo.mesh.rotation.y += 0.005;
    });

    // Add Sun self-rotation
    solarSystemObjects.sun.rotation.y += 0.001;
}

// Create starfield background
export function createStarfield(scene, count = 10000) {
    const vertices = [];
    for (let i = 0; i < count; i++) {
        // Create stars in a large sphere around the scene
        const radius = 800;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        vertices.push(x, y, z);
    }
    
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.7,
        sizeAttenuation: true
    });
    
    const starfield = new THREE.Points(starGeometry, starMaterial);
    scene.add(starfield);
    return starfield;
}

// Generate a random color in HSL format
function getRandomColor() {
    // Random vibrant color
    const hue = Math.random() * 360;
    const saturation = 0.7 + Math.random() * 0.3; // 70-100% saturation for vibrance
    const lightness = 0.5 + Math.random() * 0.3; // 50-80% lightness for brightness
    return new THREE.Color().setHSL(hue/360, saturation, lightness);
}

// Create galaxy
export function createGalaxy(scene, params = {}) {
    const options = {
        position: new THREE.Vector3(
            (Math.random() - 0.5) * 1500,
            (Math.random() - 0.5) * 1500,
            (Math.random() - 0.5) * 1500
        ),
        size: 80 + Math.random() * 150, // Bigger galaxies
        particles: 8000 + Math.random() * 7000, // More particles
        branches: 2 + Math.floor(Math.random() * 5), // Random number of arms (2-6)
        spin: 0.5 + Math.random() * 1.5, // Random spin factor
        randomness: 0.1 + Math.random() * 0.2, // Random deviation from perfect spiral
        randomnessPower: 2 + Math.random() * 2, // How much randomness increases toward edges
        insideColor: getRandomColor(),
        outsideColor: getRandomColor(),
        ...params
    };
    
    // Create galaxy geometry
    const particles = Math.floor(options.particles);
    const positions = new Float32Array(particles * 3);
    const colors = new Float32Array(particles * 3);
    const sizes = new Float32Array(particles);
    
    for (let i = 0; i < particles; i++) {
        // Position calculation
        const radius = Math.random() * options.size;
        const spinAngle = radius * options.spin;
        const branchAngle = (i % options.branches) * Math.PI * 2 / options.branches;
        
        // Add randomness to position
        const randomX = Math.pow(Math.random(), options.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * options.randomness * radius;
        const randomY = Math.pow(Math.random(), options.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * options.randomness * radius;
        const randomZ = Math.pow(Math.random(), options.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * options.randomness * radius;
        
        // Calculate position on spiral arm
        const x = Math.cos(branchAngle + spinAngle) * radius + randomX;
        const y = randomY; // Flat galaxy with some thickness from randomness
        const z = Math.sin(branchAngle + spinAngle) * radius + randomZ;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Color gradient from inside to outside
        const mixedColor = options.insideColor.clone();
        mixedColor.lerp(options.outsideColor, radius / options.size);
        
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
        
        // Varying particle sizes (smaller near center, larger on edges)
        sizes[i] = (0.2 + Math.random() * 0.8) * (0.5 + radius / options.size * 0.5);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Using a custom shader material for more control over particle rendering
    const material = new THREE.PointsMaterial({
        size: 0.7,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        transparent: true
    });
    
    const galaxy = new THREE.Points(geometry, material);
    galaxy.position.copy(options.position);
    
    // Add random rotation to the entire galaxy
    galaxy.rotation.x = Math.random() * Math.PI;
    galaxy.rotation.y = Math.random() * Math.PI;
    galaxy.rotation.z = Math.random() * Math.PI;
    
    scene.add(galaxy);
    return galaxy;
}

// Add multiple galaxies to the scene
export function createGalaxies(scene, count = 8) {
    const galaxies = [];
    for (let i = 0; i < count; i++) {
        galaxies.push(createGalaxy(scene));
    }
    return galaxies;
}
