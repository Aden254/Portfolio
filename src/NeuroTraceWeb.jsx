import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Download, Upload, Database, Maximize2, Minimize2 } from 'lucide-react';

function NeuroTraceWeb() {
    // ==================== STATE MANAGEMENT ====================

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [annotations, setAnnotations] = useState({});
    const [currentColor, setCurrentColor] = useState('#FF0000'); // Bright Red
    const [annotationSize, setAnnotationSize] = useState(50);
    const [propagationResize, setPropagationResize] = useState(0); // -10 to +10 (resize amount)
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [images, setImages] = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);

    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Sample demo images
    const demoImagePaths = [
        '/images/batch1_image_Page_01.png',
        '/images/batch1_image_Page_02.png',
        '/images/batch1_image_Page_03.png',
        '/images/batch1_image_Page_04.png',
        '/images/batch1_image_Page_05.png'
    ];

    // Expanded color palette - 15 distinct colors
    const colors = [
        { name: 'Bright Red', value: '#FF0000' },
        { name: 'Crimson', value: '#DC143C' },
        { name: 'Orange', value: '#FF8C00' },
        { name: 'Gold', value: '#FFD700' },
        { name: 'Yellow', value: '#FFFF00' },
        { name: 'Lime', value: '#00FF00' },
        { name: 'Spring Green', value: '#00FF7F' },
        { name: 'Cyan', value: '#00FFFF' },
        { name: 'Sky Blue', value: '#87CEEB' },
        { name: 'Royal Blue', value: '#4169E1' },
        { name: 'Blue Violet', value: '#8A2BE2' },
        { name: 'Magenta', value: '#FF00FF' },
        { name: 'Hot Pink', value: '#FF69B4' },
        { name: 'White', value: '#FFFFFF' },
        { name: 'Silver', value: '#C0C0C0' }
    ];

    // ==================== INITIALIZATION ====================

    useEffect(() => {
        if (uploadedImages.length > 0) {
            setImages(uploadedImages);
        } else {
            setImages(demoImagePaths);
        }
    }, [uploadedImages]);

    useEffect(() => {
        const saved = localStorage.getItem('neurotrace-annotations');
        if (saved) {
            try {
                setAnnotations(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading annotations:', e);
            }
        }
    }, []);

    useEffect(() => {
        if (Object.keys(annotations).length > 0) {
            localStorage.setItem('neurotrace-annotations', JSON.stringify(annotations));
        }
    }, [annotations]);

    useEffect(() => {
        drawCanvas();
    }, [currentImageIndex, annotations, selectedAnnotation, images]);

    // ==================== CANVAS DRAWING ====================

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const currentAnnotations = annotations[currentImageIndex] || [];
            currentAnnotations.forEach((ann, idx) => {
                const isSelected = selectedAnnotation === idx;

                // Draw circle with glow effect
                ctx.fillStyle = ann.color + (isSelected ? 'DD' : 'AA');
                ctx.shadowBlur = isSelected ? 15 : 8;
                ctx.shadowColor = ann.color;
                ctx.beginPath();
                ctx.arc(ann.x, ann.y, ann.size / 2, 0, Math.PI * 2);
                ctx.fill();

                // Reset shadow
                ctx.shadowBlur = 0;

                // Draw border
                ctx.strokeStyle = isSelected ? '#FFFFFF' : ann.color;
                ctx.lineWidth = isSelected ? 3 : 2;
                ctx.stroke();
            });
        };

        img.onerror = () => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '24px "Old Standard TT", serif';
            ctx.textAlign = 'center';
            ctx.fillText('Upload images to begin annotation', canvas.width / 2, canvas.height / 2);
        };

        if (images.length > 0 && images[currentImageIndex]) {
            img.src = images[currentImageIndex];
        } else {
            img.onerror();
        }
    };

    // ==================== ANNOTATION MANAGEMENT ====================

    const addAnnotation = () => {
        const newAnnotation = {
            x: 100,
            y: 100,
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
    };

    const deleteSelectedAnnotation = () => {
        if (selectedAnnotation === null) return;

        const updated = { ...annotations };
        updated[currentImageIndex] = updated[currentImageIndex].filter((_, idx) => idx !== selectedAnnotation);

        setAnnotations(updated);
        setSelectedAnnotation(null);
    };

    const clearAllAnnotations = () => {
        if (confirm('Clear all annotations for this image?')) {
            const updated = { ...annotations };
            updated[currentImageIndex] = [];
            setAnnotations(updated);
            setSelectedAnnotation(null);
        }
    };

    // ==================== NAVIGATION WITH SMART RESIZE ====================

    const goToPrevious = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
            setSelectedAnnotation(null);
        }
    };

    const goToNext = () => {
        if (currentImageIndex < images.length - 1) {
            const nextAnnotations = annotations[currentImageIndex + 1] || [];
            const currentAnnotations = annotations[currentImageIndex] || [];

            // Smart propagation with resize
            if (nextAnnotations.length === 0 && currentAnnotations.length > 0) {
                const updated = { ...annotations };
                updated[currentImageIndex + 1] = currentAnnotations.map(ann => {
                    // Apply resize delta when propagating
                    const newSize = Math.max(10, Math.min(150, ann.size + propagationResize));
                    return {
                        ...ann,
                        size: newSize
                    };
                });
                setAnnotations(updated);
            }

            setCurrentImageIndex(currentImageIndex + 1);
            setSelectedAnnotation(null);
        }
    };

    // ==================== MOUSE INTERACTION ====================

    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const currentAnnotations = annotations[currentImageIndex] || [];
        const clickedIdx = currentAnnotations.findIndex(ann => {
            const distance = Math.sqrt(Math.pow(x - ann.x, 2) + Math.pow(y - ann.y, 2));
            return distance <= ann.size / 2;
        });

        if (clickedIdx !== -1) {
            setSelectedAnnotation(clickedIdx);
            setIsDragging(true);
            setDragStart({ x, y });
        } else {
            setSelectedAnnotation(null);
        }
    };

    const handleCanvasMouseMove = (e) => {
        if (!isDragging || selectedAnnotation === null) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dx = x - dragStart.x;
        const dy = y - dragStart.y;

        const updated = { ...annotations };
        updated[currentImageIndex][selectedAnnotation].x += dx;
        updated[currentImageIndex][selectedAnnotation].y += dy;

        setAnnotations(updated);
        setDragStart({ x, y });
    };

    const handleCanvasMouseUp = () => {
        setIsDragging(false);
    };

    // ==================== DOCUMENT-LEVEL MOUSE HANDLERS ====================

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
            }
        };

        const handleGlobalMouseMove = (e) => {
            if (!isDragging || selectedAnnotation === null) return;

            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Continue dragging even outside canvas
            const dx = x - dragStart.x;
            const dy = y - dragStart.y;

            const updated = { ...annotations };
            updated[currentImageIndex][selectedAnnotation].x += dx;
            updated[currentImageIndex][selectedAnnotation].y += dy;

            setAnnotations(updated);
            setDragStart({ x, y });
        };

        // Add document-level listeners
        document.addEventListener('mouseup', handleGlobalMouseUp);
        document.addEventListener('mousemove', handleGlobalMouseMove);

        // Cleanup
        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, [isDragging, selectedAnnotation, dragStart, annotations, currentImageIndex]);

    // ==================== FILE OPERATIONS ====================

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setUploadedImages(imageUrls);
        setCurrentImageIndex(0);
        setAnnotations({});
        setSelectedAnnotation(null);
    };

    const exportAnnotations = () => {
        const exportData = {
            version: '2.0',
            totalImages: images.length,
            propagationResize: propagationResize,
            annotations: Object.entries(annotations).map(([imageIndex, anns]) => ({
                imageIndex: parseInt(imageIndex),
                imageName: images[imageIndex] || `image_${imageIndex}`,
                annotationCount: anns.length,
                data: anns.map((ann, idx) => ({
                    id: idx,
                    x: Math.round(ann.x),
                    y: Math.round(ann.y),
                    size: ann.size,
                    centerX: Math.round(ann.x),
                    centerY: Math.round(ann.y),
                    color: ann.color
                }))
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neurotrace_annotations_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportToCSV = () => {
        let csv = 'image_index,image_name,annotation_id,x,y,size,center_x,center_y,color\n';

        Object.entries(annotations).forEach(([imageIndex, anns]) => {
            anns.forEach((ann, idx) => {
                csv += `${imageIndex},"${images[imageIndex] || 'image_' + imageIndex}",${idx},${Math.round(ann.x)},${Math.round(ann.y)},${ann.size},${Math.round(ann.x)},${Math.round(ann.y)},"${ann.color}"\n`;
            });
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neurotrace_annotations_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ==================== KEYBOARD SHORTCUTS ====================

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'Delete' && selectedAnnotation !== null) deleteSelectedAnnotation();
            if (e.key === 'a' && e.ctrlKey) {
                e.preventDefault();
                addAnnotation();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentImageIndex, selectedAnnotation, images.length]);

    // ==================== STATISTICS ====================

    const totalAnnotations = Object.values(annotations).reduce((sum, anns) => sum + anns.length, 0);
    const currentAnnotationCount = (annotations[currentImageIndex] || []).length;

    // ==================== RENDER ====================

    return (
        <div className="min-h-screen bg-black text-white">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Old Standard TT', serif;
          background: #000000;
        }
        
        canvas {
          cursor: crosshair;
        }
        
        canvas:active {
          cursor: grabbing;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
      `}</style>

            {/* Header */}
            <header className="border-b border-gray-800 bg-black">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Database className="text-white" size={40} strokeWidth={1.5} />
                            <div>
                                <h1 className="text-4xl font-bold" style={{ letterSpacing: '0.02em' }}>NeuroTrace</h1>
                                <p className="text-gray-400 text-lg mt-1">Neural Structure Annotation Tool</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 px-5 py-3 bg-white text-black hover:bg-gray-200 transition-colors font-semibold"
                            >
                                <Download size={20} />
                                Export CSV
                            </button>
                            <button
                                onClick={exportAnnotations}
                                className="flex items-center gap-2 px-5 py-3 border border-white hover:bg-white hover:text-black transition-colors font-semibold"
                            >
                                <Download size={20} />
                                Export JSON
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-4 gap-8">

                    {/* Tools Panel */}
                    <div className="lg:col-span-1">
                        <div className="border border-gray-800 p-6 space-y-8">

                            {/* Upload Images */}
                            <div>
                                <h3 className="text-sm font-bold mb-4 tracking-wider uppercase border-b border-gray-800 pb-2">Upload Images</h3>
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
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black hover:bg-gray-200 transition-colors font-semibold"
                                >
                                    <Upload size={18} />
                                    Upload MRI Stack
                                </button>
                                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                                    Select multiple microscopy or MRI images to create an annotation stack
                                </p>
                            </div>

                            {/* Add Annotation */}
                            <div>
                                <h3 className="text-sm font-bold mb-4 tracking-wider uppercase border-b border-gray-800 pb-2">Annotation Tools</h3>
                                <button
                                    onClick={addAnnotation}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-white hover:bg-white hover:text-black transition-colors font-bold text-lg mb-4"
                                >
                                    <Plus size={20} />
                                    Add Marker
                                </button>

                                <div className="space-y-5">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Marker Size: {annotationSize}px</label>
                                        <input
                                            type="range"
                                            min="20"
                                            max="120"
                                            value={annotationSize}
                                            onChange={(e) => setAnnotationSize(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-800 appearance-none cursor-pointer accent-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400 mb-3 block">Color Palette</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {colors.map(color => (
                                                <button
                                                    key={color.value}
                                                    onClick={() => setCurrentColor(color.value)}
                                                    className={`h-12 border-2 transition-all ${currentColor === color.value ? 'border-white scale-110 shadow-lg' : 'border-gray-700 hover:border-gray-500'
                                                        }`}
                                                    style={{ backgroundColor: color.value }}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 text-center">{colors.find(c => c.value === currentColor)?.name || 'Custom'}</p>
                                    </div>

                                    {/* Smart Propagation Resize */}
                                    <div className="border border-gray-800 p-4 bg-gray-900/20">
                                        <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                                            {propagationResize < 0 ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                            Smart Propagation: {propagationResize > 0 ? '+' : ''}{propagationResize}px
                                        </label>
                                        <input
                                            type="range"
                                            min="-20"
                                            max="20"
                                            value={propagationResize}
                                            onChange={(e) => setPropagationResize(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-800 appearance-none cursor-pointer accent-white"
                                        />
                                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                            {propagationResize === 0 && "Annotations keep same size when propagating"}
                                            {propagationResize < 0 && "Annotations shrink as structure recedes"}
                                            {propagationResize > 0 && "Annotations grow as structure expands"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div>
                                <h3 className="text-sm font-bold mb-4 tracking-wider uppercase border-b border-gray-800 pb-2">Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={deleteSelectedAnnotation}
                                        disabled={selectedAnnotation === null}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-700 hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-600 transition-colors font-semibold"
                                    >
                                        <Trash2 size={18} />
                                        Delete Selected
                                    </button>
                                    <button
                                        onClick={clearAllAnnotations}
                                        className="w-full px-4 py-3 border border-gray-700 hover:bg-gray-900 transition-colors font-semibold"
                                    >
                                        Clear All (This Image)
                                    </button>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="pt-6 border-t border-gray-800">
                                <h3 className="text-sm font-bold mb-4 tracking-wider uppercase">Statistics</h3>
                                <div className="space-y-3 text-base">
                                    <div className="flex justify-between border-b border-gray-900 pb-2">
                                        <span className="text-gray-400">Total Images</span>
                                        <span className="font-bold">{images.length}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-900 pb-2">
                                        <span className="text-gray-400">Current Image</span>
                                        <span className="font-bold">{currentImageIndex + 1}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-900 pb-2">
                                        <span className="text-gray-400">This Image</span>
                                        <span className="font-bold">{currentAnnotationCount}</span>
                                    </div>
                                    <div className="flex justify-between pt-2">
                                        <span className="text-gray-400">Total Annotations</span>
                                        <span className="font-bold text-xl">{totalAnnotations}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Keyboard Shortcuts */}
                            <div className="pt-6 border-t border-gray-800">
                                <h3 className="text-sm font-bold mb-4 tracking-wider uppercase">Keyboard Shortcuts</h3>
                                <div className="space-y-2 text-sm text-gray-400">
                                    <div className="flex justify-between">
                                        <span className="font-mono">← →</span>
                                        <span>Navigate images</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-mono">Ctrl+A</span>
                                        <span>Add marker</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-mono">Delete</span>
                                        <span>Remove selected</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="lg:col-span-3">
                        <div className="border border-gray-800 p-6">

                            {/* Navigation */}
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={goToPrevious}
                                    disabled={currentImageIndex === 0}
                                    className="flex items-center gap-2 px-5 py-3 border border-white hover:bg-white hover:text-black disabled:border-gray-800 disabled:text-gray-700 disabled:hover:bg-transparent transition-colors font-semibold"
                                >
                                    <ChevronLeft size={20} />
                                    Previous
                                </button>

                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        Image {currentImageIndex + 1} <span className="text-gray-600">/</span> {images.length}
                                    </div>
                                    {currentAnnotationCount > 0 && (
                                        <div className="text-sm text-gray-400 mt-1">
                                            {currentAnnotationCount} annotation{currentAnnotationCount !== 1 ? 's' : ''} on this slice
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={goToNext}
                                    disabled={currentImageIndex === images.length - 1}
                                    className="flex items-center gap-2 px-5 py-3 border border-white hover:bg-white hover:text-black disabled:border-gray-800 disabled:text-gray-700 disabled:hover:bg-transparent transition-colors font-semibold"
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
                                    onMouseMove={handleCanvasMouseMove}
                                    onMouseUp={handleCanvasMouseUp}
                                    onMouseLeave={handleCanvasMouseUp}
                                    className="w-full border-2 border-white bg-black"
                                />

                                {selectedAnnotation !== null && (
                                    <div className="absolute top-4 right-4 bg-white text-black px-4 py-2 font-bold text-sm">
                                        ANNOTATION {selectedAnnotation + 1} SELECTED
                                    </div>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="mt-6 p-6 border border-gray-800 bg-gray-900/20">
                                <h4 className="font-bold text-lg mb-3">How to Use</h4>
                                <p className="text-gray-300 leading-relaxed">
                                    Upload your MRI or microscopy image stack, then click <span className="font-bold">"Add Marker"</span> to create annotations.
                                    Drag markers to position them precisely. When you navigate forward to an empty slice, annotations automatically
                                    propagate with smart resizing—perfect for tracking neural structures that expand or contract through 3D space.
                                    Adjust the <span className="font-bold">"Smart Propagation"</span> slider to control growth/shrinkage rate.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NeuroTraceWeb;