'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { motion, useInView, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

// Fade in when scrolled into view
export function FadeInOnScroll({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  threshold = 0.2,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// Slide in from direction when scrolled into view
export function SlideInOnScroll({
  children,
  className = '',
  direction = 'up',
  distance = 50,
  delay = 0,
  duration = 0.6,
}: {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const getInitial = () => {
    switch (direction) {
      case 'up':
        return { y: distance, opacity: 0 };
      case 'down':
        return { y: -distance, opacity: 0 };
      case 'left':
        return { x: distance, opacity: 0 };
      case 'right':
        return { x: -distance, opacity: 0 };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitial()}
      animate={isInView ? { x: 0, y: 0, opacity: 1 } : getInitial()}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Scale in when scrolled into view
export function ScaleInOnScroll({
  children,
  className = '',
  initialScale = 0.8,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  initialScale?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ scale: initialScale, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : { scale: initialScale, opacity: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation
export function StaggerOnScroll({
  children,
  className = '',
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChild({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Parallax effect based on scroll position
export function ParallaxOnScroll({
  children,
  className = '',
  speed = 0.5,
  direction = 'up',
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const yRange = direction === 'up' ? [100 * speed, -100 * speed] : [-100 * speed, 100 * speed];
  const y = useTransform(scrollYProgress, [0, 1], yRange);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y: smoothY }}>{children}</motion.div>
    </div>
  );
}

// Reveal text word by word
export function TextReveal({
  text,
  className = '',
  wordClassName = '',
}: {
  text: string;
  className?: string;
  wordClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const words = text.split(' ');

  return (
    <div ref={ref} className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          className={`inline-block mr-2 ${wordClassName}`}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.4,
            delay: index * 0.05,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

// Character by character reveal
export function CharacterReveal({
  text,
  className = '',
  charClassName = '',
}: {
  text: string;
  className?: string;
  charClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const characters = text.split('');

  return (
    <div ref={ref} className={className}>
      {characters.map((char, index) => (
        <motion.span
          key={index}
          className={`inline-block ${charClassName}`}
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{
            duration: 0.3,
            delay: index * 0.02,
            ease: 'easeOut',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </div>
  );
}

// Scroll progress indicator
export function ScrollProgress({
  color = 'ocean',
  height = 4,
  position = 'top',
}: {
  color?: 'ocean' | 'white' | 'black';
  height?: number;
  position?: 'top' | 'bottom';
}) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const colorClasses = {
    ocean: 'bg-ocean-600',
    white: 'bg-white',
    black: 'bg-gray-900',
  };

  return (
    <motion.div
      className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 ${colorClasses[color]} origin-left`}
      style={{ height, scaleX }}
    />
  );
}

// Scroll-triggered counter
export function ScrollCounter({
  value,
  className = '',
  prefix = '',
  suffix = '',
}: {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { duration: 2000, bounce: 0 });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString());

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

// Marquee animation
export function Marquee({
  children,
  className = '',
  speed = 20,
  pauseOnHover = true,
  direction = 'left',
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  pauseOnHover?: boolean;
  direction?: 'left' | 'right';
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex gap-8"
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
        whileHover={pauseOnHover ? { animationPlayState: 'paused' } : {}}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// Blur in animation
export function BlurInOnScroll({
  children,
  className = '',
  blur = 10,
  duration = 0.8,
}: {
  children: ReactNode;
  className?: string;
  blur?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, filter: `blur(${blur}px)` }}
      animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: `blur(${blur}px)` }}
      transition={{ duration, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// Rotate in animation
export function RotateInOnScroll({
  children,
  className = '',
  rotation = 15,
  duration = 0.6,
}: {
  children: ReactNode;
  className?: string;
  rotation?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, rotate: rotation }}
      animate={isInView ? { opacity: 1, rotate: 0 } : { opacity: 0, rotate: rotation }}
      transition={{ duration, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Flip in animation
export function FlipInOnScroll({
  children,
  className = '',
  axis = 'x',
  duration = 0.6,
}: {
  children: ReactNode;
  className?: string;
  axis?: 'x' | 'y';
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const initial = axis === 'x' ? { rotateX: 90 } : { rotateY: 90 };
  const animate = axis === 'x' ? { rotateX: 0 } : { rotateY: 0 };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ perspective: 1000 }}
    >
      <motion.div
        initial={{ ...initial, opacity: 0 }}
        animate={isInView ? { ...animate, opacity: 1 } : { ...initial, opacity: 0 }}
        transition={{ duration, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Typewriter effect
export function Typewriter({
  text,
  className = '',
  speed = 50,
  cursor = true,
}: {
  text: string;
  className?: string;
  speed?: number;
  cursor?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (!isInView) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isInView, text, speed]);

  return (
    <span ref={ref} className={className}>
      {displayText}
      {cursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-0.5 h-[1em] bg-current ml-0.5"
        />
      )}
    </span>
  );
}

function useState(initialValue: string): [string, React.Dispatch<React.SetStateAction<string>>] {
  const [state, setState] = __useState(initialValue);
  return [state, setState];
}

import { useState as __useState } from 'react';
