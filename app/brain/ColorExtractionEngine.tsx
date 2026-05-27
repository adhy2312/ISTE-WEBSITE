'use client';

import { useEffect, useRef } from 'react';
import { useBrain } from './BrainProvider';

/**
 * ENGINE 46: COLOR EXTRACTION ENGINE (Generative UI)
 * When a user hovers over prominent images (e.g., ExeCom avatars, Event galleries),
 * this engine extracts the dominant color of the image via a hidden Canvas
 * and shifts the organism's ambient glow to match it.
 */
export default function ColorExtractionEngine() {
  const brain = useBrain();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    brain.registerEngine('ColorExtraction');

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 50;
      canvasRef.current.height = 50;
    }

    const extractColor = (imgEl: HTMLImageElement) => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Ensure cross-origin allows reading data if hosted externally
        // Note: For Next.js image optimization, we might face CORS issues, 
        // so we wrap in try-catch.
        ctx.drawImage(imgEl, 0, 0, 50, 50);
        const data = ctx.getImageData(0, 0, 50, 50).data;
        
        let r = 0, g = 0, b = 0;
        const length = data.length;
        
        // Sample every 4th pixel for speed
        let count = 0;
        for (let i = 0; i < length; i += 16) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        // Boost saturation slightly
        brain.notifyEngine('Creative', 'ambient_glow', { color: `rgba(${r}, ${g}, ${b}, 0.12)` });
      } catch (e) {
        // CORS or other canvas errors, ignore silently
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'img') {
        const img = target as HTMLImageElement;
        // Only run on images with class 'object-cover' or in specific sections
        // Next.js images often have a src starting with /_next/
        if (img.src && !img.src.includes('.svg')) {
           extractColor(img);
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'img') {
        // Reset to default
        document.documentElement.style.removeProperty('--ambient-glow');
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    
    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return null;
}
