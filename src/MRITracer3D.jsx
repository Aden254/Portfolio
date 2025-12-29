import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// ==================== IMPORT FONT ====================
// Add this CSS import for Gowun Batang
const fontImport = document.createElement('link');
fontImport.href = 'https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap';
fontImport.rel = 'stylesheet';
document.head.appendChild(fontImport);

function MRITracer3D() {
    // ==================== STATE ====================
    const [currentSliceIndex, setCurrentSliceIndex] = useState(0);
    const [points, setPoints] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [showWireframe, setShowWireframe] = useState(true);
    const [showSurface, setShowSurface] = useState(true);
    const [showHero, setShowHero] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Your MRI images
    const [mriImages, setMriImages] = useState([
        '/images/mri/1.png',
        '/images/mri/2.png',
        '/images/mri/3.png',
        '/images/mri/4.png',
        '/images/mri/5.png',
        '/images/mri/6.png',
        '/images/mri/7.png'
    ]);

    // Refs
    const canvas2DRef = useRef(null);
    const container3DRef = useRef(null);
    const imageRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const starsCanvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Three.js refs
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const meshGroupRef = useRef(null);



    // ==================== STARRY BACKGROUND ====================
    useEffect(() => {
        const canvas = starsCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Generate stars
        const stars = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                opacity: Math.random()
            });
        }

        // Animate stars (twinkling)
        let frame = 0;
        const animate = () => {
            ctx.fillStyle = '#0a0e27';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach((star, i) => {
                const twinkle = Math.sin(frame * 0.01 + i) * 0.5 + 0.5;
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            frame++;
            requestAnimationFrame(animate);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);


    // ==================== SCROLL HANDLING ====================
    useEffect(() => {
        const handleScroll = () => {
            if (!scrollContainerRef.current) return;

            const scrollTop = scrollContainerRef.current.scrollTop;
            const heroHeight = window.innerHeight;
            const dataManagementStart = heroHeight;
            const dataManagementHeight = 500; // Approximate height of data management section

            // Calculate hero scroll progress (0 to 1)
            const heroProgress = Math.min(scrollTop / heroHeight, 1);
            setScrollProgress(heroProgress);

            // Hide hero when scrolled past
            if (scrollTop > heroHeight * 0.3) {
                setShowHero(false);
            } else {
                setShowHero(true);
            }

            // Calculate data management opacity based on scroll
            const dataManagementElement = document.getElementById('data-management-section');
            if (dataManagementElement) {
                const distanceScrolledPast = scrollTop - dataManagementStart;
                const fadeOutProgress = Math.min(distanceScrolledPast / dataManagementHeight, 1);

                // Fade out as user scrolls through data management section
                const opacity = 1 - fadeOutProgress;
                dataManagementElement.style.opacity = opacity;

                // Optional: Also scale down slightly
                const scale = 1 - (fadeOutProgress * 0.1); // Shrinks to 90%
                dataManagementElement.style.transform = `scale(${scale})`;

                // Disable pointer events when faded out
                if (opacity < 0.3) {
                    dataManagementElement.style.pointerEvents = 'none';
                } else {
                    dataManagementElement.style.pointerEvents = 'auto';
                }
            }
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);


    // ==================== SETUP THREE.JS SCENE ====================
    useEffect(() => {
        const container = container3DRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0e27); // Dark night sky
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
        camera.position.set(400, 300, 800);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controlsRef.current = controls;

        const meshGroup = new THREE.Group();
        scene.add(meshGroup);
        meshGroupRef.current = meshGroup;

        // Grid (subtle)
        const gridHelper = new THREE.GridHelper(400, 10, 0x1a1f3a, 0x0f1220);
        gridHelper.rotation.z = Math.PI / 2;
        scene.add(gridHelper);

        // Axes (subtle)
        const axesHelper = new THREE.AxesHelper(200);
        axesHelper.material.opacity = 0.5;
        axesHelper.material.transparent = true;
        scene.add(axesHelper);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x6699ff, 0.4);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0x88bbff, 0.6);
        directionalLight1.position.set(500, 500, 500);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0x4466aa, 0.3);
        directionalLight2.position.set(-500, -500, -500);
        scene.add(directionalLight2);

        const handleResize = () => {
            if (!container) return;
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', handleResize);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);


    // ==================== CALCULATE BOUNDING BOX ====================
    const calculateBoundingBox = (allPoints) => {
        if (Object.keys(allPoints).length === 0) return null;

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        const sliceSpacing = 20;

        Object.entries(allPoints).forEach(([sliceIndex, slicePoints]) => {
            const sliceNum = parseInt(sliceIndex);
            const xPosition = sliceNum * sliceSpacing;

            slicePoints.forEach(point => {
                const x = xPosition;
                const y = 600 - point.y;
                const z = point.x;

                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
                minZ = Math.min(minZ, z);
                maxZ = Math.max(maxZ, z);
            });
        });

        return {
            min: { x: minX, y: minY, z: minZ },
            max: { x: maxX, y: maxY, z: maxZ },
            center: {
                x: (minX + maxX) / 2,
                y: (minY + maxY) / 2,
                z: (minZ + maxZ) / 2
            },
            size: {
                x: maxX - minX,
                y: maxY - minY,
                z: maxZ - minZ
            }
        };
    };


    // ==================== FIND NEAREST NEIGHBORS ====================
    const findNearestNeighbors = (point, targetPoints, maxConnections = 3) => {
        const distances = targetPoints.map((targetPoint, index) => ({
            index,
            point: targetPoint,
            distance: Math.sqrt(
                Math.pow(point.y - targetPoint.y, 2) +
                Math.pow(point.x - targetPoint.x, 2)
            )
        }));

        distances.sort((a, b) => a.distance - b.distance);
        return distances.slice(0, maxConnections);
    };


    // ==================== CREATE 3D MESH ====================
    const create3DMesh = (allPoints) => {
        const meshGroup = meshGroupRef.current;
        if (!meshGroup) return;

        while (meshGroup.children.length > 0) {
            const child = meshGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            meshGroup.remove(child);
        }

        const sliceIndices = Object.keys(allPoints).map(Number).sort((a, b) => a - b);
        if (sliceIndices.length === 0) return;

        const sliceSpacing = 20;

        // Create filled polygons for each slice
        sliceIndices.forEach((sliceIndex) => {
            const slicePoints = allPoints[sliceIndex];
            if (slicePoints.length < 3) return;

            const xPosition = sliceIndex * sliceSpacing;

            // Cosmic color scheme
            const colorHue = 0.6 - (sliceIndex / mriImages.length) * 0.2; // Blue to purple
            const color = new THREE.Color().setHSL(colorHue, 0.8, 0.6);

            const vertices = [];
            const indices = [];

            slicePoints.forEach((point) => {
                const y = 600 - point.y;
                const z = point.x;
                vertices.push(xPosition, y, z);
            });

            for (let i = 1; i < slicePoints.length - 1; i++) {
                indices.push(0, i, i + 1);
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setIndex(indices);
            geometry.computeVertexNormals();

            const material = new THREE.MeshStandardMaterial({
                color: color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: showSurface ? 0.7 : 0,
                emissive: color,
                emissiveIntensity: 0.3,
                metalness: 0.3,
                roughness: 0.7
            });

            const mesh = new THREE.Mesh(geometry, material);
            meshGroup.add(mesh);

            if (showWireframe) {
                const outlinePoints = [];
                slicePoints.forEach((point) => {
                    outlinePoints.push(new THREE.Vector3(xPosition, 600 - point.y, point.x));
                });
                outlinePoints.push(new THREE.Vector3(xPosition, 600 - slicePoints[0].y, slicePoints[0].x));

                const outlineGeometry = new THREE.BufferGeometry().setFromPoints(outlinePoints);
                const outlineMaterial = new THREE.LineBasicMaterial({
                    color: color.clone().multiplyScalar(1.5),
                    linewidth: 2
                });
                const outline = new THREE.Line(outlineGeometry, outlineMaterial);
                meshGroup.add(outline);
            }

            slicePoints.forEach(point => {
                const sphereGeometry = new THREE.SphereGeometry(2, 12, 12);
                const sphereMaterial = new THREE.MeshStandardMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 0.6,
                    metalness: 0.5,
                    roughness: 0.5
                });
                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.position.set(xPosition, 600 - point.y, point.x);
                meshGroup.add(sphere);
            });
        });

        // Connect slices with mesh
        for (let i = 0; i < sliceIndices.length - 1; i++) {
            const currentSlice = sliceIndices[i];
            const nextSlice = sliceIndices[i + 1];

            const currentPoints = allPoints[currentSlice];
            const nextPoints = allPoints[nextSlice];

            if (currentPoints.length === 0 || nextPoints.length === 0) continue;

            const xCurrent = currentSlice * sliceSpacing;
            const xNext = nextSlice * sliceSpacing;

            const colorHue = 0.6 - (currentSlice / mriImages.length) * 0.2;
            const color = new THREE.Color().setHSL(colorHue, 0.7, 0.5);

            const vertices = [];
            const indices = [];
            let vertexIndex = 0;

            currentPoints.forEach((currentPoint, cpIndex) => {
                const cy = 600 - currentPoint.y;
                const cz = currentPoint.x;

                const nextCpIndex = (cpIndex + 1) % currentPoints.length;
                const nextCurrentPoint = currentPoints[nextCpIndex];
                const ncy = 600 - nextCurrentPoint.y;
                const ncz = nextCurrentPoint.x;

                const neighbors = findNearestNeighbors(currentPoint, nextPoints, 2);

                neighbors.forEach((neighbor) => {
                    const nextPoint = neighbor.point;
                    const ny = 600 - nextPoint.y;
                    const nz = nextPoint.x;

                    const v1 = vertexIndex++;
                    vertices.push(xCurrent, cy, cz);

                    const v2 = vertexIndex++;
                    vertices.push(xCurrent, ncy, ncz);

                    const v3 = vertexIndex++;
                    vertices.push(xNext, ny, nz);

                    indices.push(v1, v2, v3);
                });
            });

            if (vertices.length > 0) {
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                geometry.setIndex(indices);
                geometry.computeVertexNormals();

                const material = new THREE.MeshStandardMaterial({
                    color: color,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: showSurface ? 0.5 : 0,
                    emissive: color,
                    emissiveIntensity: 0.2,
                    metalness: 0.2,
                    roughness: 0.8
                });

                const mesh = new THREE.Mesh(geometry, material);
                meshGroup.add(mesh);

                if (showWireframe) {
                    const edgesGeometry = new THREE.EdgesGeometry(geometry);
                    const edgesMaterial = new THREE.LineBasicMaterial({
                        color: color.clone().multiplyScalar(1.2),
                        linewidth: 1,
                        transparent: true,
                        opacity: 0.6
                    });
                    const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial);
                    meshGroup.add(wireframe);
                }
            }
        }

        // Auto-center camera
        const bbox = calculateBoundingBox(allPoints);
        if (bbox && controlsRef.current && cameraRef.current) {
            controlsRef.current.target.set(bbox.center.x, bbox.center.y, bbox.center.z);

            const maxDim = Math.max(bbox.size.x, bbox.size.y, bbox.size.z);
            const fov = cameraRef.current.fov * (Math.PI / 180);
            const cameraDistance = maxDim / (2 * Math.tan(fov / 2)) * 1.8;

            cameraRef.current.position.set(
                bbox.center.x + cameraDistance * 0.8,
                bbox.center.y + cameraDistance * 0.6,
                bbox.center.z + cameraDistance * 0.8
            );

            cameraRef.current.lookAt(bbox.center.x, bbox.center.y, bbox.center.z);
            controlsRef.current.update();
        }
    };


    // ==================== UPDATE 3D WHEN POINTS CHANGE ====================
    useEffect(() => {
        create3DMesh(points);
    }, [points, showWireframe, showSurface]);


    // ==================== LOAD MRI IMAGE ====================
    useEffect(() => {
        const canvas = canvas2DRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            imageRef.current = img;
            canvas.width = 800;
            canvas.height = 600;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            redrawPoints(ctx);
            setIsLoading(false);
        };

        img.onerror = () => {
            console.error('Failed to load image:', mriImages[currentSliceIndex]);
            setIsLoading(false);
        };

        setIsLoading(true);
        img.src = mriImages[currentSliceIndex];

    }, [currentSliceIndex]);


    // ==================== REDRAW POINTS ====================
    const redrawPoints = (ctx) => {
        const slicePoints = points[currentSliceIndex] || [];

        ctx.strokeStyle = '#00ff88';
        ctx.fillStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff88';

        slicePoints.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();

            if (index > 0) {
                const prevPoint = slicePoints[index - 1];
                ctx.beginPath();
                ctx.moveTo(prevPoint.x, prevPoint.y);
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
            }
        });

        if (slicePoints.length > 2) {
            const firstPoint = slicePoints[0];
            const lastPoint = slicePoints[slicePoints.length - 1];
            ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(firstPoint.x, firstPoint.y);
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
    };


    // ==================== HANDLE CANVAS CLICK ====================
    const handleCanvasClick = (e) => {
        const canvas = canvas2DRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setPoints(prevPoints => {
            const updatedPoints = { ...prevPoints };

            if (!updatedPoints[currentSliceIndex]) {
                updatedPoints[currentSliceIndex] = [];
            }

            updatedPoints[currentSliceIndex] = [
                ...updatedPoints[currentSliceIndex],
                { x, y }
            ];

            return updatedPoints;
        });

        const ctx = canvas.getContext('2d');
        if (imageRef.current) {
            ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
        }

        const updatedSlicePoints = [...(points[currentSliceIndex] || []), { x, y }];

        ctx.strokeStyle = '#00ff88';
        ctx.fillStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff88';

        updatedSlicePoints.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();

            if (index > 0) {
                const prevPoint = updatedSlicePoints[index - 1];
                ctx.beginPath();
                ctx.moveTo(prevPoint.x, prevPoint.y);
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
            }
        });

        if (updatedSlicePoints.length > 2) {
            ctx.beginPath();
            ctx.moveTo(updatedSlicePoints[updatedSlicePoints.length - 1].x, updatedSlicePoints[updatedSlicePoints.length - 1].y);
            ctx.lineTo(updatedSlicePoints[0].x, updatedSlicePoints[0].y);
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
    };


    // ==================== CLEAR CURRENT SLICE ====================
    const clearCurrentSlice = () => {
        setPoints(prevPoints => {
            const updatedPoints = { ...prevPoints };
            updatedPoints[currentSliceIndex] = [];
            return updatedPoints;
        });

        const canvas = canvas2DRef.current;
        if (canvas && imageRef.current) {
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
        }
    };


    // ==================== RESET CAMERA VIEW ====================
    const resetCameraView = () => {
        const bbox = calculateBoundingBox(points);
        if (!bbox || !controlsRef.current || !cameraRef.current) return;

        controlsRef.current.target.set(bbox.center.x, bbox.center.y, bbox.center.z);

        const maxDim = Math.max(bbox.size.x, bbox.size.y, bbox.size.z);
        const fov = cameraRef.current.fov * (Math.PI / 180);
        const cameraDistance = maxDim / (2 * Math.tan(fov / 2)) * 1.8;

        cameraRef.current.position.set(
            bbox.center.x + cameraDistance * 0.8,
            bbox.center.y + cameraDistance * 0.6,
            bbox.center.z + cameraDistance * 0.8
        );

        cameraRef.current.lookAt(bbox.center.x, bbox.center.y, bbox.center.z);
        controlsRef.current.update();
    };


    // ==================== NAVIGATION ====================
    const goToPrevious = () => {
        if (currentSliceIndex > 0) {
            setCurrentSliceIndex(currentSliceIndex - 1);
        }
    };

    const goToNext = () => {
        if (currentSliceIndex < mriImages.length - 1) {
            setCurrentSliceIndex(currentSliceIndex + 1);
        }
    };

    const currentPointCount = (points[currentSliceIndex] || []).length;
    const totalPoints = Object.values(points).reduce((sum, arr) => sum + arr.length, 0);

    // ==================== UPLOAD MRI IMAGES ====================
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Clear existing points
        setPoints({});
        setCurrentSliceIndex(0);

        // Create URLs from uploaded files
        const imageUrls = files.map(file => URL.createObjectURL(file));

        // Update state with new images
        setMriImages(imageUrls);

        alert(` ${files.length} images uploaded successfully! Ready to trace.`);
    };


    // ==================== EXPORT COORDINATES (JSON) ====================
    const exportCoordinatesJSON = () => {
        const exportData = {
            projectName: "NeuroVerse 3D Reconstruction",
            exportDate: new Date().toISOString(),
            totalSlices: Object.keys(points).length,
            totalPoints: Object.values(points).reduce((sum, arr) => sum + arr.length, 0),
            sliceSpacing: 20,
            coordinates: points
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `neuroverse-reconstruction-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert(' Coordinates exported as JSON!');
    };


    // ==================== EXPORT COORDINATES (CSV) ====================
    const exportCoordinatesCSV = () => {
        let csvContent = "Slice,PointIndex,X,Y,Z\n";

        const sliceSpacing = 20;

        Object.entries(points).forEach(([sliceIndex, slicePoints]) => {
            const sliceNum = parseInt(sliceIndex);
            const xPosition = sliceNum * sliceSpacing;

            slicePoints.forEach((point, index) => {
                const y = 600 - point.y;
                const z = point.x;
                csvContent += `${sliceNum},${index},${xPosition},${y},${z}\n`;
            });
        });

        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `neuroverse-coordinates-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert(' Coordinates exported as CSV!');
    };


    // ==================== EXPORT 3D MODEL (OBJ) ====================
    const export3DModel = () => {
        if (Object.keys(points).length === 0) {
            alert(' No data to export! Please trace some slices first.');
            return;
        }

        let objContent = "# NeuroVerse 3D Model Export\n";
        objContent += "# Created: " + new Date().toISOString() + "\n\n";

        const sliceSpacing = 20;
        let vertexIndex = 1;
        const vertexMap = {};

        // Generate vertices
        Object.entries(points).forEach(([sliceIndex, slicePoints]) => {
            const sliceNum = parseInt(sliceIndex);
            const xPosition = sliceNum * sliceSpacing;

            slicePoints.forEach((point, index) => {
                const y = 600 - point.y;
                const z = point.x;

                objContent += `v ${xPosition} ${y} ${z}\n`;
                vertexMap[`${sliceNum}-${index}`] = vertexIndex++;
            });
        });

        objContent += "\n# Faces\n";

        // Generate faces (triangles between slices)
        const sliceIndices = Object.keys(points).map(Number).sort((a, b) => a - b);

        for (let i = 0; i < sliceIndices.length - 1; i++) {
            const currentSlice = sliceIndices[i];
            const nextSlice = sliceIndices[i + 1];

            const currentPoints = points[currentSlice];
            const nextPoints = points[nextSlice];

            const minLen = Math.min(currentPoints.length, nextPoints.length);

            for (let j = 0; j < minLen; j++) {
                const v1 = vertexMap[`${currentSlice}-${j}`];
                const v2 = vertexMap[`${currentSlice}-${(j + 1) % currentPoints.length}`];
                const v3 = vertexMap[`${nextSlice}-${j}`];
                const v4 = vertexMap[`${nextSlice}-${(j + 1) % nextPoints.length}`];

                if (v1 && v2 && v3) objContent += `f ${v1} ${v2} ${v3}\n`;
                if (v2 && v4 && v3) objContent += `f ${v2} ${v4} ${v3}\n`;
            }
        }

        const dataBlob = new Blob([objContent], { type: 'text/plain' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `neuroverse-3d-model-${Date.now()}.obj`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert(' 3D Model exported as OBJ! You can open this in Blender, MeshLab, or 3D printers!');
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>

            {/* Starry Background */}
            <canvas
                ref={starsCanvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1
                }}
            />

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                style={{
                    width: '100%',
                    height: '100vh',
                    overflowY: 'scroll',
                    scrollBehavior: 'smooth',
                    background: 'transparent'
                }}
            >

                {/* HERO SECTION */}
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px',
                        textAlign: 'center',
                        opacity: showHero ? 1 - scrollProgress : 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: showHero ? 'auto' : 'none'
                    }}
                >
                    <h1
                        style={{
                            fontSize: '5rem',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            marginBottom: '30px',
                            fontFamily: "'Gowun Batang', 'Times New Roman', serif",
                            letterSpacing: '-2px'
                        }}
                    >
                        NeuroVerse 3D
                    </h1>

                    <p
                        style={{
                            fontSize: '1.5rem',
                            color: '#b8c5d6',
                            maxWidth: '800px',
                            marginBottom: '50px',
                            lineHeight: '1.8',
                            fontFamily: "'Gowun Batang', 'Times New Roman', serif",
                        }}
                    >
                        Transform MRI brain slices into stunning 3D reconstructions.
                        Trace cortical contours, watch them stack in real-time, and visualize
                        neural architecture like never before.
                    </p>

                    <div
                        style={{
                            padding: '25px 40px',
                            background: 'rgba(102, 126, 234, 0.1)',
                            border: '2px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '15px',
                            backdropFilter: 'blur(10px)',
                            maxWidth: '900px',
                            marginBottom: '60px'
                        }}
                    >
                        <h3 style={{ color: '#88bbff', marginBottom: '15px', fontSize: '1.3rem' }}>
                            How It Works
                        </h3>
                        <ol
                            style={{
                                textAlign: 'left',
                                color: '#b8c5d6',
                                lineHeight: '2',
                                fontSize: '1.1rem',
                                paddingLeft: '20px',
                                fontFamily: "'Gowun Batang', 'Times New Roman', serif",
                            }}
                        >
                            <li>Click on the MRI image to trace brain contours</li>
                            <li>Navigate between slices using Previous/Next buttons</li>
                            <li>Watch your tracings build into a 3D mesh in real-time</li>
                            <li>Rotate, zoom, and explore your reconstruction</li>
                            <li>Toggle surface and wireframe views for different perspectives</li>
                        </ol>
                    </div>

                    <div
                        style={{
                            fontSize: '3rem',
                            animation: 'bounce 2s infinite',
                            color: '#667eea',
                            cursor: 'pointer',
                            fontFamily: "'Gowun Batang', 'Times New Roman', serif"
                        }}
                        onClick={() => scrollContainerRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                    >
                        ↓
                    </div>

                    <style>
                        {`
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
              }
            `}
                    </style>
                </div>


                {/* DATA MANAGEMENT SECTION - FULL WIDTH PURPLE */}
                <div
                    id="data-management-section"
                    style={{
                        padding: '60px 40px',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                        borderTop: '2px solid rgba(102, 126, 234, 0.3)',
                        borderBottom: '2px solid rgba(102, 126, 234, 0.3)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transition: 'opacity 0.3s ease, transform 0.3s ease'
                    }}
                >
                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />

                    <h2 style={{
                        color: '#c8b1ff',
                        fontSize: '2.5rem',
                        marginBottom: '15px',
                        fontFamily: "'Gowun Batang', 'Times New Roman', serif",
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #b8a4ff 0%, #d4a5ff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Data Management
                    </h2>

                    <p style={{
                        color: '#b8c5d6',
                        fontSize: '1.1rem',
                        marginBottom: '40px',
                        textAlign: 'center',
                        maxWidth: '700px',
                        fontFamily: "'Gowun Batang', 'Times New Roman', serif"
                    }}>
                        Upload your own MRI images or export your 3D reconstructions in multiple formats
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '20px',
                        width: '100%',
                        maxWidth: '1200px'
                    }}>


                        {/* Upload Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                padding: '24px 32px',
                                fontSize: '16px',
                                background: 'linear-gradient(135deg, #5a3a5f 0%, #7a4a6a 50%, #8b5572 100%)', // ← MAROON GRADIENT
                                color: '#e0d4d8', // ← Dimmed white
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                boxShadow: '0 8px 25px rgba(90, 58, 95, 0.3)', // ← Maroon shadow
                                fontFamily: "'Gowun Batang', 'Times New Roman', serif",
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                minHeight: '140px',
                                opacity: 0.85 // ← Slightly dimmed
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 12px 35px rgba(90, 58, 95, 0.5)';
                                e.currentTarget.style.opacity = '1'; // ← Brighten on hover
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(90, 58, 95, 0.3)';
                                e.currentTarget.style.opacity = '0.85'; // ← Back to dimmed
                            }}
                        >

                            <span style={{ fontSize: '1.1rem' }}>Upload MRI Images</span>
                            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>PNG, JPG, DICOM</span>
                        </button>

                        {/* Export JSON */}
                        <button
                            onClick={exportCoordinatesJSON}
                            disabled={Object.keys(points).length === 0}
                            style={{
                                padding: '24px 32px',
                                fontSize: '16px',
                                background: Object.keys(points).length === 0
                                    ? 'rgba(26, 31, 58, 0.5)'
                                    : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                color: '#fff',
                                border: 'none',
                                cursor: Object.keys(points).length === 0 ? 'not-allowed' : 'pointer',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                boxShadow: Object.keys(points).length === 0 ? 'none' : '0 8px 25px rgba(67, 233, 123, 0.4)',
                                opacity: Object.keys(points).length === 0 ? 0.4 : 1,
                                fontFamily: "'Gowun Batang', 'Times New Roman', serif",
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                minHeight: '140px',
                                opacity: 0.85
                            }}
                            onMouseEnter={(e) => {
                                if (Object.keys(points).length > 0) {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(67, 233, 123, 0.5)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (Object.keys(points).length > 0) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(67, 233, 123, 0.4)';
                                }
                            }}
                        >

                            <span style={{ fontSize: '1.1rem' }}>Export JSON</span>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>For Python, MATLAB</span>
                        </button>

                        {/* Export CSV */}
                        <button
                            onClick={exportCoordinatesCSV}
                            disabled={Object.keys(points).length === 0}
                            style={{
                                padding: '24px 32px',
                                fontSize: '16px',
                                background: Object.keys(points).length === 0
                                    ? 'rgba(26, 31, 58, 0.5)'
                                    : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                color: '#fff',
                                border: 'none',
                                cursor: Object.keys(points).length === 0 ? 'not-allowed' : 'pointer',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                boxShadow: Object.keys(points).length === 0 ? 'none' : '0 8px 25px rgba(250, 112, 154, 0.4)',
                                opacity: Object.keys(points).length === 0 ? 0.4 : 1,
                                fontFamily: "'Gowun Batang', 'Times New Roman', serif",
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                minHeight: '140px',
                                opacity: 0.85
                            }}
                            onMouseEnter={(e) => {
                                if (Object.keys(points).length > 0) {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(250, 112, 154, 0.5)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (Object.keys(points).length > 0) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(250, 112, 154, 0.4)';
                                }
                            }}
                        >

                            <span style={{ fontSize: '1.1rem' }}>Export CSV</span>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>For Excel, R</span>
                        </button>

                        {/* Export 3D Model */}
                        <button
                            onClick={export3DModel}
                            disabled={Object.keys(points).length === 0}
                            style={{
                                padding: '24px 32px',
                                fontSize: '16px',
                                background: Object.keys(points).length === 0
                                    ? 'rgba(26, 31, 58, 0.5)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                border: 'none',
                                cursor: Object.keys(points).length === 0 ? 'not-allowed' : 'pointer',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                boxShadow: Object.keys(points).length === 0 ? 'none' : '0 8px 25px rgba(102, 126, 234, 0.4)',
                                opacity: Object.keys(points).length === 0 ? 0.4 : 1,
                                fontFamily: "'Gowun Batang', 'Times New Roman', serif",
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                minHeight: '140px',
                                opacity: 0.85
                            }}
                            onMouseEnter={(e) => {
                                if (Object.keys(points).length > 0) {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.5)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (Object.keys(points).length > 0) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                                }
                            }}
                        >

                            <span style={{ fontSize: '1.1rem' }}>Export 3D Model</span>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>OBJ for Blender</span>
                        </button>
                    </div>

                    <div style={{
                        marginTop: '30px',
                        padding: '20px 30px',
                        background: 'rgba(102, 126, 234, 0.1)',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        borderRadius: '10px',
                        maxWidth: '800px',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            fontSize: '14px',
                            color: '#b8c5d6',
                            fontFamily: "'Gowun Batang', 'Times New Roman', serif",
                            lineHeight: '1.6'
                        }}>
                            <strong style={{ color: '#c8b1ff' }}>💡 Tip:</strong> Trace at least 3 slices for best 3D reconstruction results.
                            Exported files are compatible with Blender, Python, MATLAB, Excel, and most 3D software.
                        </p>
                    </div>
                </div>

                {/* MAIN APP PANELS */}
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '20px',
                        gap: '20px',
                        background: 'rgba(10, 14, 39, 0.8)',
                        backdropFilter: 'blur(10px)'
                    }}
                >

                    {/* LEFT PANEL */}
                    <div
                        style={{
                            width: '50%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                            alignSelf: 'stretch'
                        }}
                    >
                        <h2 style={{
                            color: '#88bbff',
                            fontSize: '2rem',
                            marginBottom: '10px',
                            fontFamily: "'Gowun Batang', 'Times New Roman', serif"
                        }}>
                            2D MRI Slicer
                        </h2>

                        <div style={{ fontSize: '14px', color: '#7a8fb3' }}>
                            <div>Slice {currentSliceIndex + 1} of {mriImages.length}</div>
                            <div>Points on slice: {currentPointCount} | Total: {totalPoints}</div>
                        </div>

                        <canvas
                            ref={canvas2DRef}
                            onClick={handleCanvasClick}
                            style={{
                                border: '2px solid #667eea',
                                backgroundColor: '#0f1220',
                                cursor: 'crosshair',
                                maxWidth: '100%',
                                boxShadow: '0 0 30px rgba(102, 126, 234, 0.3)'
                            }}
                        />

                        {isLoading && (
                            <div style={{ position: 'absolute', color: '#88bbff', fontSize: '20px', marginTop: '300px', marginLeft: '200px' }}>
                                Loading slice...
                            </div>
                        )}

                        {/* Navigation buttons only (removed Data Management from here) */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                onClick={goToPrevious}
                                disabled={currentSliceIndex === 0}
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    background: currentSliceIndex === 0 ? '#1a1f3a' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: currentSliceIndex === 0 ? 'not-allowed' : 'pointer',
                                    opacity: currentSliceIndex === 0 ? 0.5 : 1,
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                                    fontFamily: "'Gowun Batang', 'Times New Roman', serif"
                                }}
                            >
                                ← Previous
                            </button>

                            <button
                                onClick={goToNext}
                                disabled={currentSliceIndex === mriImages.length - 1}
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    background: currentSliceIndex === mriImages.length - 1 ? '#1a1f3a' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: currentSliceIndex === mriImages.length - 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentSliceIndex === mriImages.length - 1 ? 0.5 : 1,
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                                    fontFamily: "'Gowun Batang', 'Times New Roman', serif"
                                }}
                            >
                                Next →
                            </button>

                            <button
                                onClick={clearCurrentSlice}
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)',
                                    fontFamily: "'Gowun Batang', 'Times New Roman', serif"
                                }}
                            >
                                Clear Slice
                            </button>
                        </div>
                    </div>


                    {/* RIGHT PANEL */}
                    <div
                        style={{
                            width: '50%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                            overflow: 'hidden'
                        }}
                    >
                        <h2 style={{ color: '#88bbff', fontSize: '2rem', marginBottom: '10px', fontFamily: "'Gowun Batang', 'Times New Roman', serif" }}>
                            3D Reconstruction
                        </h2>

                        <div
                            ref={container3DRef}
                            style={{
                                border: '2px solid #667eea',
                                backgroundColor: '#0a0e27',
                                height: '600px',
                                width: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 0 30px rgba(102, 126, 234, 0.3)',
                                borderRadius: '10px'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#b8c5d6' }}>
                                <input
                                    type="checkbox"
                                    checked={showSurface}
                                    onChange={(e) => setShowSurface(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                Show Surface
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#b8c5d6' }}>
                                <input
                                    type="checkbox"
                                    checked={showWireframe}
                                    onChange={(e) => setShowWireframe(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                Show Wireframe
                            </label>

                            <button
                                onClick={resetCameraView}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
                                    fontFamily: "'Gowun Batang', 'Times New Roman', serif"
                                }}
                            >
                                Reset View
                            </button>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div
                    style={{
                        padding: '40px 20px 20px',
                        background: 'rgba(10, 14, 39, 0.95)',
                        borderTop: '1px solid rgba(102, 126, 234, 0.2)',
                        color: '#7a8fb3',
                        fontSize: '12px',
                        textAlign: 'left',
                        fontFamily: "'Gowun Batang', 'Times New Roman', serif"
                    }}
                >
                    <p style={{ marginBottom: '5px' }}>
                        <strong style={{ color: '#88bbff' }}>NeuroVerse 3D</strong> — Built with React, Three.js & WebGL
                    </p>
                    <p style={{ marginBottom: '5px' }}>
                        Created by Aden | 2024
                    </p>
                    <p style={{ marginBottom: '5px' }}>
                        <a href="mailto:daudiaden4@gmail.com" style={{ color: '#667eea', textDecoration: 'none' }}>
                            Contact
                        </a>
                        {' | '}
                        <a href="https://github.com/Aden254" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none' }}>
                            GitHub
                        </a>
                        {' | '}
                        <a href="https://www.linkedin.com/in/daudi-aden/" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none' }}>
                            LinkedIn
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default MRITracer3D;