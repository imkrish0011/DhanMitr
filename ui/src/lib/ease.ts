export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const SPRING_SWAP = {
  type: 'spring' as const,
  stiffness: 450,
  damping: 32,
  mass: 0.8,
};

export const SPRING_FOLDER = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 32,
  mass: 0.9,
};
