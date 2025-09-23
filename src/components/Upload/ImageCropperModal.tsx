'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Modal, Slider, Radio, Space, Button } from 'antd';

type Aspect = 'square' | 'cover' | 'standard';

interface ImageCropperModalProps {
  open: boolean;
  file: File | null;
  aspect?: Aspect; // square (1:1), cover (3:1), standard (4:3)
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
}

const aspectToRatio = (aspect: Aspect): number => {
  switch (aspect) {
    case 'cover':
      return 3 / 1;
    case 'standard':
      return 4 / 3;
    case 'square':
    default:
      return 1;
  }
};

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ open, file, aspect = 'square', onCancel, onCropped }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [dragging, setDragging] = useState<boolean>(false);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startDrag, setStartDrag] = useState<{ x: number; y: number } | null>(null);
  const [currentAspect, setCurrentAspect] = useState<Aspect>(aspect);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImgUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImgUrl(null);
    }
  }, [file]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    setStartDrag({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !startDrag) return;
    setOffset({ x: e.clientX - startDrag.x, y: e.clientY - startDrag.y });
  };

  const handleMouseUp = () => {
    setDragging(false);
    setStartDrag(null);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    setDragging(true);
    setStartDrag({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragging || !startDrag) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - startDrag.x, y: t.clientY - startDrag.y });
  };

  const handleTouchEnd = () => {
    setDragging(false);
    setStartDrag(null);
  };

  const performCrop = async () => {
    if (!imgRef.current || !containerRef.current) return;
    const image = imgRef.current;
    const container = containerRef.current;
    const ratio = aspectToRatio(currentAspect);

    // Output dimensions
    const outWidth = 1200; // reasonable canvas width
    const outHeight = Math.round(outWidth / ratio);

    const canvas = document.createElement('canvas');
    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Compute image draw size based on zoom to cover container
    const naturalW = image.naturalWidth;
    const naturalH = image.naturalHeight;

    // Fit image to container's crop box height first
    const cropBoxWidth = container.clientWidth;
    const cropBoxHeight = Math.min(360, Math.max(200, Math.floor(container.clientWidth / ratio)));

    const scaleToCover = Math.max(cropBoxWidth / naturalW, cropBoxHeight / naturalH);
    const scale = scaleToCover * zoom;

    const drawW = naturalW * scale;
    const drawH = naturalH * scale;

    // Offset center baseline to top-left baseline in output coords
    // Map container offsets to output canvas scale
    const scaleX = outWidth / cropBoxWidth;
    const scaleY = outHeight / cropBoxHeight;

    const dx = offset.x * scaleX + (outWidth - drawW * (outWidth / cropBoxWidth)) / 2;
    const dy = offset.y * scaleY + (outHeight - drawH * (outHeight / cropBoxHeight)) / 2;

    // Simpler approach: draw image centered plus offset proportional to zoom
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, outWidth, outHeight);

    // Compute image top-left in crop box coordinates
    const centerX = outWidth / 2 + offset.x * scaleX;
    const centerY = outHeight / 2 + offset.y * scaleY;
    const x = centerX - drawW * (outWidth / cropBoxWidth) / 2;
    const y = centerY - drawH * (outHeight / cropBoxHeight) / 2;

    // Use drawImage scaling
    ctx.drawImage(image, x, y, drawW * (outWidth / cropBoxWidth), drawH * (outHeight / cropBoxHeight));

    canvas.toBlob((blob) => {
      if (blob) onCropped(blob);
    }, 'image/jpeg', 0.9);
  };

  if (!open) return null;

  return (
    <Modal
      title="Adjust Photo"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <div ref={containerRef} style={{ width: '100%' }}>
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            width: '100%',
            height: Math.min(360, Math.max(200, Math.floor((containerRef.current?.clientWidth || 600) / aspectToRatio(currentAspect)))),
            border: '1px solid #d9d9d9',
            borderRadius: 8,
            overflow: 'hidden',
            position: 'relative',
            background: '#f5f5f5',
            cursor: 'grab'
          }}
        >
          {imgUrl && (
            <img
              ref={imgRef}
              src={imgUrl}
              alt="to-crop"
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                transformOrigin: 'center center',
                userSelect: 'none',
                pointerEvents: 'none',
                maxWidth: 'none',
              }}
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            Aspect:&nbsp;
            <Radio.Group value={currentAspect} onChange={(e) => setCurrentAspect(e.target.value)}>
              <Radio.Button value="square">Square</Radio.Button>
              <Radio.Button value="standard">4:3</Radio.Button>
              <Radio.Button value="cover">Cover 3:1</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            Zoom
            <Slider min={0.5} max={3} step={0.01} value={zoom} onChange={setZoom} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={performCrop}>Save</Button>
          </div>
        </Space>
      </div>
    </Modal>
  );
};

export default ImageCropperModal;


