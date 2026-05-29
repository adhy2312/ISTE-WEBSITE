export const EASING = {
  premium: "power4.out",      // Apple-like smooth decel
  cinematic: "expo.out",      // Sharp entry, very long tail
  editorial: "power2.inOut",  // Elegant, symmetric rhythm
  snap: "back.out(1.2)",      // Confident, slight overshoot
  linear: "none"
};

export const TIMING = {
  micro: 0.3,
  base: 0.8,
  reveal: 1.2,
  ambient: 2.5,
  cinematic: 2.0
};
