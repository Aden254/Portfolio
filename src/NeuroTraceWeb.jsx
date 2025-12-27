import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Download, Upload, Database } from 'lucide-react';

function NeuroTraceWeb() {
    // State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [annotations, setAnnotations] = useState({});
    const [currentColor, setCurrentColor] = useState('#FF0000');
    const [annotationSize, setAnnotationSize] = useState(50);
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [uploadedImages, setUploadedImages] = useState([]);
    const [demoMode, setDemoMode] = useState(false);

    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Demo images - YOUR EM images
    const demoImages = [
        '/images/demo/demo_brain_slice_1.png',
        '/images/demo/demo_brain_slice_2.png',
        '/images/demo/demo_brain_slice_3.png'
    ];

    // Demo annotations
    const demoAnnotations = {
        0: [
            { x: 350, y: 300, size: 80, color: '#FF0000' },
            { x: 600, y: 350, size: 60, color: '#00FFFF' },
            { x: 450, y: 480, size: 55, color: '#FFD700' }
        ],
        1: [
            { x: 355, y: 305, size: 82, color: '#FF0000' },
            { x: 595, y: 355, size: 62, color: '#00FFFF' },
            { x: 450, y: 475, size: 57, color: '#FFD700' }
        ],
        2: [
            { x: 360, y: 310, size: 85, color: '#FF0000' },
            { x: 590, y: 360, size: 65, color: '#00FFFF' },
            { x: 450, y: 470, size: 60, color: '#FFD700' }
        ]
    };

    const images = uploadedImages.length > 0 ? uploadedImages : (demoMode ? demoImages : []);

    const colors = [
        { name: 'Red', value: '#FF0000' },
        { name: 'Orange', value: '#FF8C00' },
        { name: 'Yellow', value: '#FFFF00' },
        { name: 'Lime', value: '#00FF00' },
        { name: 'Cyan', value: '#00FFFF' },
        { name: 'Blue', value: '#4169E1' },
        { name: 'Magenta', value: '#FF00FF' },
        { name: 'White', value: '#FFFFFF' }
    ];

    // Start demo
    const startDemo = () => {
        console.log('🎮 Starting demo mode');
        setDemoMode(true);
        setCurrentImageIndex(0);
        setAnnotations(JSON.parse(JSON.stringify(demoAnnotations)));
        setSelectedAnnotation(null);
        console.log('Demo images:', demoImages);
        console.log('Demo annotations loaded:', demoAnnotations);
    };

    // Draw canvas - SIMPLIFIED AND DEBUGGED
    useEffect(() => {
        console.log('🎨 Drawing canvas, currentImageIndex:', currentImageIndex, 'images.length:', images.length);

        const canvas = canvasRef.current;
        if (!canvas) {
            console.error('❌ Canvas ref is null!');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('❌ Could not get 2d context!');
            return;
        }

        console.log('✅ Canvas and context ready');

        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Check if we have images
        if (images.length === 0) {
            console.log('📝 No images, showing instruction text');
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Click "Try Demo" to begin', canvas.width / 2, canvas.height / 2);
            return;
        }

        const currentImage = images[currentImageIndex];
        console.log('🖼️ Loading image:', currentImage);

        // Load image
        const img = new Image();

        img.onload = () => {
            console.log('✅ Image loaded successfully!');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Draw annotations
            const currentAnnotations = annotations[currentImageIndex] || [];
            console.log('🎯 Drawing', currentAnnotations.length, 'annotations');

            currentAnnotations.forEach((ann, idx) => {
                const isSelected = selectedAnnotation === idx;

                ctx.fillStyle = ann.color + (isSelected ? 'DD' : 'AA');
                ctx.shadowBlur = isSelected ? 15 : 8;
                ctx.shadowColor = ann.color;
                ctx.beginPath();
                ctx.arc(ann.x, ann.y, ann.size / 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.strokeStyle = isSelected ? '#FFFFFF' : ann.color;
                ctx.lineWidth = isSelected ? 3 : 2;
                ctx.stroke();
            });
        };

        img.onerror = (e) => {
            console.error('❌ Image failed to load:', currentImage, e);
            console.log('🎨 Drawing fallback background');

            // Fallback - draw simple background
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#666666';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Image failed to load: ' + currentImage, canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillText('Check browser console (F12) for errors', canvas.width / 2, canvas.height / 2 + 20);

            // Still draw annotations
            const currentAnnotations = annotations[currentImageIndex] || [];
            currentAnnotations.forEach((ann, idx) => {
                const isSelected = selectedAnnotation === idx;
                ctx.fillStyle = ann.color + (isSelected ? 'DD' : 'AA');
                ctx.shadowBlur = isSelected ? 15 : 8;
                ctx.shadowColor = ann.color;
                ctx.beginPath();
                ctx.arc(ann.x, ann.y, ann.size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = isSelected ? '#FFFFFF' : ann.color;
                ctx.lineWidth = isSelected ? 3 : 2;
                ctx.stroke();
            });
        };

        img.src = currentImage;

    }, [currentImageIndex, annotations, selectedAnnotation, images]);

    // Mouse handlers with proper scaling
    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        console.log('🖱️ Canvas clicked at:', x, y);

        const currentAnnotations = annotations[currentImageIndex] || [];
        const clickedIdx = currentAnnotations.findIndex(ann => {
            const distance = Math.sqrt(Math.pow(x - ann.x, 2) + Math.pow(y - ann.y, 2));
            return distance <= ann.size / 2;
        });

        if (clickedIdx !== -1) {
            console.log('✅ Selected annotation:', clickedIdx);
            setSelectedAnnotation(clickedIdx);
            setIsDragging(true);
            setDragStart({ x, y });
        } else {
            setSelectedAnnotation(null);
        }
    };

    // Double-click to deselect
    const handleCanvasDoubleClick = (e) => {
        e.preventDefault();
        console.log('👆👆 Double-click detected - deselecting annotation');
        setSelectedAnnotation(null);
        setIsDragging(false);
    };

    // Right-click to deselect
    const handleCanvasRightClick = (e) => {
        e.preventDefault(); // Prevent context menu
        console.log('🖱️ Right-click detected - deselecting annotation');
        setSelectedAnnotation(null);
        setIsDragging(false);
    };

    const handleCanvasMouseMove = (e) => {
        if (!isDragging || selectedAnnotation === null) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const dx = x - dragStart.x;
        const dy = y - dragStart.y;

        const updated = { ...annotations };
        updated[currentImageIndex][selectedAnnotation].x += dx;
        updated[currentImageIndex][selectedAnnotation].y += dy;

        setAnnotations(updated);
        setDragStart({ x, y });
    };

    const addAnnotation = () => {
        const newAnnotation = {
            x: 450,
            y: 337,
            size: annotationSize,
            color: currentColor
        };

        const updated = { ...annotations };
        if (!updated[currentImageIndex]) {
            updated[currentImageIndex] = [];
        }
        updated[currentImageIndex].push(newAnnotation);

        setAnnotations(updated);
        setSelectedAnnotation(updated[currentImageIndex].length - 1);
        console.log('➕ Added annotation:', newAnnotation);
    };

    const deleteSelectedAnnotation = () => {
        if (selectedAnnotation === null) return;

        const updated = { ...annotations };
        updated[currentImageIndex] = updated[currentImageIndex].filter((_, idx) => idx !== selectedAnnotation);

        setAnnotations(updated);
        setSelectedAnnotation(null);
    };

    const goToPrevious = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
            setSelectedAnnotation(null);
        }
    };

    const goToNext = () => {
        if (currentImageIndex < images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
            setSelectedAnnotation(null);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setUploadedImages(imageUrls);
        setCurrentImageIndex(0);
        setAnnotations({});
        setSelectedAnnotation(null);
        setDemoMode(false);
    };

    const exportToCSV = () => {
        let csv = 'image_index,annotation_id,x,y,size,color\n';
        Object.entries(annotations).forEach(([imageIndex, anns]) => {
            anns.forEach((ann, idx) => {
                csv += `${imageIndex},${idx},${Math.round(ann.x)},${Math.round(ann.y)},${ann.size},"${ann.color}"\n`;
            });
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neurotrace_annotations.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const totalAnnotations = Object.values(annotations).reduce((sum, anns) => sum + anns.length, 0);
    const currentAnnotationCount = (annotations[currentImageIndex] || []).length;

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                goToPrevious();
            } else if (e.key === 'ArrowRight') {
                goToNext();
            } else if (e.key === 'Delete' && selectedAnnotation !== null) {
                deleteSelectedAnnotation();
            } else if (e.key === 'Escape') {
                console.log('⌨️ Escape pressed - deselecting annotation');
                setSelectedAnnotation(null);
                setIsDragging(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentImageIndex, selectedAnnotation, images.length]);

    // Console log on mount
    useEffect(() => {
        console.log(' NeuroTrace mounted');
        console.log(' Initial state:', {
            demoMode,
            images: images.length,
            currentImageIndex
        });
    }, []);

    return (
        <div className="min-h-screen text-white" style={{
            background: 'linear-gradient(to bottom, #800020 0%, #DC143C 50%, #FFFFFF 100%)',
            backgroundAttachment: 'fixed'
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Old Standard TT', serif;
        }
        
        canvas {
          cursor: crosshair;
        }
        
        canvas:active {
          cursor: grabbing;
        }
        
        /* Smooth transitions */
        button {
          transition: all 0.3s ease;
        }
        
        input[type="range"] {
          cursor: pointer;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        
        input[type="range"]::-webkit-slider-track {
          background: #374151;
          height: 8px;
          border-radius: 4px;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: pointer;
          border: 2px solid #000;
          margin-top: -6px;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          background: #FFD700;
          transform: scale(1.1);
        }
        
        input[type="range"]::-moz-range-track {
          background: #374151;
          height: 8px;
          border-radius: 4px;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: pointer;
          border: 2px solid #000;
        }
        
        input[type="range"]::-moz-range-thumb:hover {
          background: #FFD700;
          transform: scale(1.1);
        }
      `}</style>

            {/* Header */}
            <header className="border-b border-gray-800 bg-black">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Custom Neuron Icon */}
                            <svg width="50" height="50" viewBox="0 0 50 50" className="flex-shrink-0">
                                {/* Navy blue background */}
                                <rect width="50" height="50" fill="#001F3F" rx="4" />

                                {/* Concentric circles - yellow */}
                                <circle cx="25" cy="20" r="14" fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.8" />
                                <circle cx="25" cy="20" r="10" fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.9" />
                                <circle cx="25" cy="20" r="6" fill="none" stroke="#FFD700" strokeWidth="1.5" />
                                <circle cx="25" cy="20" r="3" fill="#FFD700" />

                                {/* Root-like protrusion coming from outer circle */}
                                <path
                                    d="M 25 34 Q 23 38 25 42 Q 27 44 25 47"
                                    fill="none"
                                    stroke="#FFD700"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M 25 42 Q 20 43 18 46"
                                    fill="none"
                                    stroke="#FFD700"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    opacity="0.8"
                                />
                                <path
                                    d="M 25 42 Q 30 43 32 46"
                                    fill="none"
                                    stroke="#FFD700"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    opacity="0.8"
                                />
                            </svg>

                            <div>
                                <h1 className="text-4xl font-bold">NeuroTrace</h1>
                                <p className="text-gray-400 text-lg mt-1">Neuron Tracing & Annotation Tool for Microscopy</p>
                            </div>
                        </div>

                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-5 py-3 bg-white text-black hover:bg-gray-200 font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                            <Download size={20} />
                            Export CSV
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">


                <div className="grid lg:grid-cols-4 gap-8">

                    {/* Tools Panel */}
                    <div className="lg:col-span-1 border border-gray-800 bg-black/80 backdrop-blur-md p-6 space-y-6 shadow-xl">

                        {/* Upload/Demo */}
                        <div>
                            <h3 className="text-sm font-bold mb-4 tracking-wider uppercase border-b border-gray-800 pb-2">
                                Load Images
                            </h3>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black hover:bg-gray-200 font-semibold mb-3 shadow-md hover:shadow-lg transition-all"
                            >
                                <Upload size={18} />
                                Upload Images
                            </button>

                            <button
                                onClick={startDemo}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black font-semibold shadow-md hover:shadow-lg transition-all"
                            >
                                Try Demo
                            </button>
                        </div>

                        {/* Size */}
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">
                                Marker Size: {annotationSize}px
                            </label>
                            <input
                                type="range"
                                min="20"
                                max="120"
                                value={annotationSize}
                                onChange={(e) => setAnnotationSize(parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        {/* Colors */}
                        <div>
                            <label className="text-sm text-gray-400 mb-3 block">Color Palette</label>
                            <div className="grid grid-cols-4 gap-2">
                                {colors.map(color => (
                                    <button
                                        key={color.value}
                                        onClick={() => setCurrentColor(color.value)}
                                        className={`h-12 border-2 ${currentColor === color.value ? 'border-white' : 'border-gray-700'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Add Marker */}
                        <button
                            onClick={addAnnotation}
                            className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-white hover:bg-white hover:text-black font-bold text-lg shadow-md hover:shadow-lg transition-all"
                        >
                            <Plus size={20} />
                            Add Marker
                        </button>

                        {/* Delete */}
                        <button
                            onClick={deleteSelectedAnnotation}
                            disabled={selectedAnnotation === null}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-700 hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-600 font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                            <Trash2 size={18} />
                            Delete Selected
                        </button>

                        {/* Stats */}
                        <div className="pt-6 border-t border-gray-800">
                            <h3 className="text-sm font-bold mb-4 tracking-wider uppercase">Statistics</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Images</span>
                                    <span className="font-bold">{images.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">This Image</span>
                                    <span className="font-bold">{currentAnnotationCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Annotations</span>
                                    <span className="font-bold text-xl">{totalAnnotations}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="lg:col-span-3 border border-gray-800 bg-black/80 backdrop-blur-md p-6 shadow-xl">

                        {/* Navigation */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={goToPrevious}
                                disabled={currentImageIndex === 0}
                                className="flex items-center gap-2 px-5 py-3 border border-white hover:bg-white hover:text-black disabled:border-gray-800 disabled:text-gray-700 disabled:hover:bg-transparent font-semibold shadow-md hover:shadow-lg transition-all"
                            >
                                <ChevronLeft size={20} />
                                Previous
                            </button>

                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    Image {images.length > 0 ? currentImageIndex + 1 : 0} / {images.length}
                                </div>
                                {currentAnnotationCount > 0 && (
                                    <div className="text-sm text-gray-400 mt-1">
                                        {currentAnnotationCount} annotation{currentAnnotationCount !== 1 ? 's' : ''}
                                    </div>
                                )}
                                {demoMode && (
                                    <div className="text-xs text-blue-400 mt-1">
                                        🔬 Demo Mode - EM Images
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={goToNext}
                                disabled={currentImageIndex === images.length - 1}
                                className="flex items-center gap-2 px-5 py-3 border border-white hover:bg-white hover:text-black disabled:border-gray-800 disabled:text-gray-700 disabled:hover:bg-transparent font-semibold shadow-md hover:shadow-lg transition-all"
                            >
                                Next
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Canvas */}
                        <div className="relative">
                            <canvas
                                ref={canvasRef}
                                width={900}
                                height={675}
                                onClick={handleCanvasClick}
                                onDoubleClick={handleCanvasDoubleClick}
                                onContextMenu={handleCanvasRightClick}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={() => setIsDragging(false)}
                                onMouseLeave={() => setIsDragging(false)}
                                className="w-full border-2 border-white bg-black cursor-crosshair"
                            />

                            {selectedAnnotation !== null && (
                                <div className="absolute top-4 right-4 bg-white text-black px-4 py-2 font-bold text-sm">
                                    ANNOTATION {selectedAnnotation + 1} SELECTED
                                </div>
                            )}
                        </div>


                        {/* Controls Guide */}
                        <div className="mt-6 p-4 border border-blue-800 bg-blue-900/40 backdrop-blur-sm shadow-md">
                            <h4 className="font-bold text-blue-400 mb-3">Controls</h4>
                            <div className="space-y-2 text-sm text-gray-300">
                                <div><span className="text-white font-bold">Click</span> annotation → Select it</div>
                                <div><span className="text-white font-bold">Drag</span> selected annotation → Move it</div>
                                <div className="pt-2 border-t border-blue-800 mt-2">
                                    <div className="text-yellow-400 font-bold mb-1">Deselect Options:</div>
                                    <div><span className="text-white font-bold">Double-click</span> anywhere</div>
                                    <div><span className="text-white font-bold">Right-click</span> anywhere</div>
                                    <div><span className="text-white font-bold">Esc</span> key</div>
                                    <div><span className="text-white font-bold">Click</span> empty space</div>
                                </div>
                                <div className="pt-2 border-t border-blue-800 mt-2">
                                    <div><span className="text-white font-bold">← →</span> Arrow keys → Navigate slices</div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NeuroTraceWeb;