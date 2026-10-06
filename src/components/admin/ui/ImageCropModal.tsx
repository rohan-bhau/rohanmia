'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadCloud, Check, X, ZoomIn, ZoomOut, Loader2, RotateCcw } from 'lucide-react';
import AdminModal from '@/components/admin/ui/AdminModal';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { uploadImage } from '@/actions/upload';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newImageUrl: string) => void;
  title?: string;
  subtitle?: string;
}

export default function ImageCropModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Upload & Crop Image",
  subtitle = "Select an image, drag to position within the square frame, and upload to Cloudinary."
}: ImageCropModalProps) {
  const { currentTheme } = useThemeAccent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setImageSrc(null);
      setImageObj(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setErrorMsg(null);
    }
  }, [isOpen]);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setImageSrc(url);
      const img = new Image();
      img.onload = () => {
        setImageObj(img);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setErrorMsg(null);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  // Draw the image onto the square canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width; // 400px viewport
    ctx.clearRect(0, 0, size, size);

    // Save context
    ctx.save();

    // Clip to square viewport
    ctx.beginPath();
    ctx.rect(0, 0, size, size);
    ctx.clip();

    // Calculate dimensions
    const imgWidth = imageObj.width;
    const imgHeight = imageObj.height;
    const imgAspect = imgWidth / imgHeight;

    let drawWidth = size;
    let drawHeight = size;

    if (imgAspect > 1) {
      // Landscape: fit height first
      drawHeight = size * zoom;
      drawWidth = drawHeight * imgAspect;
    } else {
      // Portrait / Square: fit width first
      drawWidth = size * zoom;
      drawHeight = drawWidth / imgAspect;
    }

    const centerX = size / 2 + pan.x;
    const centerY = size / 2 + pan.y;

    const destX = centerX - drawWidth / 2;
    const destY = centerY - drawHeight / 2;

    ctx.drawImage(imageObj, destX, destY, drawWidth, drawHeight);

    // Draw square grid overlay (Rule of Thirds, matching Facebook crop style)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    // Horizontal grid
    ctx.beginPath();
    ctx.moveTo(0, size / 3);
    ctx.lineTo(size, size / 3);
    ctx.moveTo(0, (size / 3) * 2);
    ctx.lineTo(size, (size / 3) * 2);
    // Vertical grid
    ctx.moveTo(size / 3, 0);
    ctx.lineTo(size / 3, size);
    ctx.moveTo((size / 3) * 2, 0);
    ctx.lineTo((size / 3) * 2, size);
    ctx.stroke();

    // Border around crop square
    ctx.strokeStyle = currentTheme.primary;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, size - 2, size - 2);

    ctx.restore();
  }, [imageObj, zoom, pan, currentTheme.primary]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse / Touch drag to pan
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch drag
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Crop & Upload
  const handleCropAndUpload = async () => {
    if (!imageObj) return;
    setUploading(true);
    setErrorMsg(null);

    try {
      // Create high-res 800x800 export canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 800;
      exportCanvas.height = 800;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context');

      const size = 800;
      const scaleFactor = 800 / (canvasRef.current?.width || 400);

      const imgWidth = imageObj.width;
      const imgHeight = imageObj.height;
      const imgAspect = imgWidth / imgHeight;

      let drawWidth = size;
      let drawHeight = size;

      if (imgAspect > 1) {
        drawHeight = size * zoom;
        drawWidth = drawHeight * imgAspect;
      } else {
        drawWidth = size * zoom;
        drawHeight = drawWidth / imgAspect;
      }

      const centerX = size / 2 + pan.x * scaleFactor;
      const centerY = size / 2 + pan.y * scaleFactor;

      const destX = centerX - drawWidth / 2;
      const destY = centerY - drawHeight / 2;

      ctx.drawImage(imageObj, destX, destY, drawWidth, drawHeight);

      // Convert to Blob
      const blob = await new Promise<Blob | null>((resolve) => {
        exportCanvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
      });

      if (!blob) throw new Error('Canvas export failed');

      const formData = new FormData();
      formData.append('file', blob, 'cropped-image.jpg');

      const res = await uploadImage(formData);

      if (res.success && res.url) {
        onSuccess(res.url);
        onClose();
      } else {
        setErrorMsg(res.error || 'Cloudinary upload failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading cropped image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {!imageSrc ? (
          /* Empty State: Select File */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-white/30 rounded-3xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
          >
            <div 
              className="p-4 rounded-2xl bg-white/[0.04] group-hover:scale-110 transition-transform"
              style={{ color: currentTheme.primary }}
            >
              <UploadCloud size={32} />
            </div>
            <div className="text-center">
              <span className="text-xs font-semibold text-white block">
                Click to browse photo
              </span>
              <span className="text-[11px] font-mono text-neutral-400 mt-1 block">
                JPEG, PNG, or WebP up to 10MB
              </span>
            </div>
          </div>
        ) : (
          /* Cropper Workspace */
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center">
              {/* Square Viewfinder Canvas */}
              <div className="relative w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/20 select-none cursor-move">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={340}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="w-full h-full"
                />
              </div>

              <span className="text-[10px] font-mono text-neutral-400 mt-2">
                Drag to reposition &bull; Square crop box (1:1)
              </span>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-3 px-2">
              <ZoomOut size={14} className="text-neutral-500 shrink-0" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-white py-1 cursor-pointer"
              />
              <ZoomIn size={14} className="text-neutral-500 shrink-0" />
              <button
                type="button"
                onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                title="Reset zoom and pan"
                className="p-1 rounded text-neutral-400 hover:text-white"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Choose Different Image Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-mono text-neutral-400 hover:text-white underline underline-offset-4"
              >
                Choose a different photo
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          {imageSrc && (
            <button
              type="button"
              onClick={handleCropAndUpload}
              disabled={uploading}
              style={{
                backgroundColor: currentTheme.primary,
                color: currentTheme.contrastText,
                boxShadow: `0 0 20px ${currentTheme.glow}`,
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-tight transition-all cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Uploading to Cloudinary...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Crop &amp; Save Portrait</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </AdminModal>
  );
}
