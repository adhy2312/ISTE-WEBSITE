'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface GalleryImage {
  url: string;
  alt?: string;
}

interface GalleryLightboxProps {
  images: GalleryImage[];
}

export default function GalleryLightbox({ images }: GalleryLightboxProps) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  const openAt = useCallback((idx: number) => {
    setCurrent(idx);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    if (!overlayRef.current) return;
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => setOpen(false),
    });
  }, []);

  const navigate = useCallback((dir: 1 | -1) => {
    if (!imgRef.current) return;
    const exitX = dir > 0 ? -60 : 60;
    gsap.to(imgRef.current, {
      x: exitX, opacity: 0, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        setCurrent(c => (c + dir + images.length) % images.length);
        gsap.fromTo(imgRef.current,
          { x: -exitX, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }
        );
      },
    });
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'ArrowLeft') navigate(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, close, navigate]);

  // Entrance animation
  useEffect(() => {
    if (open && overlayRef.current) {
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      if (imgRef.current) {
        gsap.fromTo(imgRef.current,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
        );
      }
    }
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!images.length) return null;

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="lightbox-grid">
        {images.map((img, i) => (
          <button
            key={i}
            className="lightbox-thumb"
            onClick={() => openAt(i)}
            aria-label={`View ${img.alt || `image ${i + 1}`} full screen`}
          >
            <div className="thumb-inner">
              <Image
                src={img.url}
                alt={img.alt || `Gallery image ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="thumb-overlay">
                <ZoomIn size={20} color="white" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Overlay */}
      {open && (
        <div
          className="lb-overlay"
          ref={overlayRef}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close */}
          <button className="lb-close" onClick={close} aria-label="Close lightbox">
            <X size={22} />
          </button>

          {/* Counter */}
          <div className="lb-counter">
            {current + 1} / {images.length}
          </div>

          {/* Main Image */}
          <div className="lb-img-wrapper" ref={imgRef}>
            <Image
              src={images[current].url}
              alt={images[current].alt || `Image ${current + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                className="lb-nav lb-prev"
                onClick={() => navigate(-1)}
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                className="lb-nav lb-next"
                onClick={() => navigate(1)}
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="lb-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`lb-dot ${i === current ? 'active' : ''}`}
                  onClick={() => {
                    const dir = i > current ? 1 : -1;
                    setCurrent(i);
                    if (imgRef.current) {
                      gsap.fromTo(imgRef.current,
                        { x: -dir * 40, opacity: 0 },
                        { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
                      );
                    }
                  }}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        /* Thumbnail Grid */
        .lightbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
          margin: 32px 0;
        }
        .lightbox-thumb {
          border: none;
          padding: 0;
          background: none;
          cursor: pointer;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 1/1;
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .lightbox-thumb:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .thumb-inner {
          position: absolute; inset: 0;
          border-radius: 12px;
          overflow: hidden;
        }
        .thumb-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s ease;
          opacity: 0;
          border-radius: 12px;
        }
        .lightbox-thumb:hover .thumb-overlay {
          background: rgba(0, 0, 0, 0.45);
          opacity: 1;
        }

        /* Overlay */
        .lb-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(5, 8, 14, 0.95);
          backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lb-close {
          position: absolute; top: 20px; right: 24px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: #e2e8f0; border-radius: 50%;
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 10;
          transition: background 0.2s;
        }
        .lb-close:hover { background: rgba(255,255,255,0.15); }

        .lb-counter {
          position: absolute; top: 24px; left: 50%; transform: translateX(-50%);
          font-family: var(--font-mono); font-size: 0.75rem;
          color: #64748b; letter-spacing: 0.1em;
          z-index: 10;
        }

        .lb-img-wrapper {
          position: relative;
          width: min(90vw, 900px);
          height: min(80vh, 700px);
        }

        .lb-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2e8f0; border-radius: 50%;
          width: 52px; height: 52px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 10;
          transition: background 0.2s, transform 0.2s;
        }
        .lb-nav:hover {
          background: rgba(255,255,255,0.14);
          transform: translateY(-50%) scale(1.08);
        }
        .lb-prev { left: 24px; }
        .lb-next { right: 24px; }

        .lb-dots {
          position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 8px; z-index: 10;
        }
        .lb-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.25);
          border: none; cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          padding: 0;
        }
        .lb-dot.active {
          background: #60a5fa;
          transform: scale(1.4);
          box-shadow: 0 0 8px #60a5fa;
        }

        @media (max-width: 640px) {
          .lb-prev { left: 8px; }
          .lb-next { right: 8px; }
          .lb-nav { width: 40px; height: 40px; }
          .lightbox-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}
