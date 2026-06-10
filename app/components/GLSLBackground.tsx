'use client'

import React, { useRef, useEffect } from 'react';
import { useBrain } from '../brain/BrainProvider';

export default function GLSLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const brain = useBrain();

  useEffect(() => {
    brain.registerEngine('WebGL');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Compile Shader
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    // Vertex Shader
    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);

    // Fragment Shader (Liquid/Neural Network Effect)
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_scrollVelocity;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 mouse = u_mouse / u_resolution.xy;
        
        // Center the coordinates
        uv = uv * 2.0 - 1.0;
        uv.x *= u_resolution.x / u_resolution.y;
        mouse = mouse * 2.0 - 1.0;
        mouse.x *= u_resolution.x / u_resolution.y;

        // Interaction with mouse
        float dist = distance(uv, vec2(mouse.x, -mouse.y));
        float mouseGlow = smoothstep(1.0, 0.0, dist) * 0.5;

        // Evolving noise pattern reacting to BrainProvider 0-lag scroll velocity
        float n = noise(uv * 3.0 + u_time * 0.2 + (u_scrollVelocity * 0.005));
        n += noise(uv * 6.0 - u_time * 0.3) * 0.5;
        n += noise(uv * 12.0 + u_time * 0.1) * 0.25;

        // Colors
        vec3 color1 = vec3(0.05, 0.1, 0.2); // Dark blue background
        vec3 color2 = vec3(0.2, 0.4, 0.8); // Lighter blue structure
        vec3 highlight = vec3(0.5, 0.8, 1.0); // Mouse interaction highlight

        vec3 finalColor = mix(color1, color2, n);
        finalColor += highlight * mouseGlow;

        // Subtle vignette
        float vignette = smoothstep(2.0, 0.5, length(uv));
        finalColor *= vignette;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
    const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    // Create Program
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Geometry (Fullscreen Quad)
    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
      -1.0,  1.0,
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
    const scrollVelLoc = gl.getUniformLocation(program, 'u_scrollVelocity');

    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Render Loop
    let animationFrameId: number;
    const render = (time: number) => {
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;
      
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      }

      gl.uniform2f(resLoc, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(mouseLoc, mouseX, mouseY);
      
      // Zero-lag direct ref read from BrainProvider
      const scrollVel = brain.scrollVelocityRef.current || 0;
      gl.uniform1f(scrollVelLoc, scrollVel);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1, // Behind all content
        pointerEvents: 'none', // Allow clicks to pass through
        opacity: 0.8, // Blend subtly with the background color
      }}
    />
  );
}
