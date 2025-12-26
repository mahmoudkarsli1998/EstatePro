import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export const useFadeIn = (options = {}) => {
  const ref = useRef(null);
  const {
    direction = 'up',
    delay = 0,
    duration = 1,
    distance = 50,
    threshold = 0.1,
    ease = 'power3.out',
  } = options;

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    const x = direction === 'left' ? distance : direction === 'right' ? -distance : 0;
    const y = direction === 'up' ? distance : direction === 'down' ? -distance : 0;

    gsap.fromTo(
      el,
      { autoAlpha: 0, x, y },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration,
        delay,
        ease,
        scrollTrigger: {
          trigger: el,
          start: `top ${100 - threshold * 100}%`,
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, { scope: ref });

  return ref;
};

export const useSlideIn = (options = {}) => {
  const ref = useRef(null);
  const {
    direction = 'left',
    delay = 0,
    duration = 1,
    distance = 100,
    threshold = 0.1,
    ease = 'power3.out',
  } = options;

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    const x = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
    const y = direction === 'up' ? -distance : direction === 'down' ? distance : 0;

    gsap.fromTo(
      el,
      { x, y, autoAlpha: 0 },
      {
        x: 0,
        y: 0,
        autoAlpha: 1,
        duration,
        delay,
        ease,
        scrollTrigger: {
          trigger: el,
          start: `top ${100 - threshold * 100}%`,
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, { scope: ref });

  return ref;
};

export const useStaggerList = (options = {}) => {
  const containerRef = useRef(null);
  const {
    selector = '.stagger-item',
    delay = 0,
    stagger = 0.1,
    duration = 0.8,
    distance = 30,
    threshold = 0.1,
    ease = 'power2.out',
    dependencies = []
  } = options;

  useGSAP(() => {
    const el = containerRef.current;
    if (!el) return;

    const items = el.querySelectorAll(selector);
    if (items.length === 0) return;

    gsap.fromTo(
      items,
      { autoAlpha: 0, y: distance },
      {
        autoAlpha: 1,
        y: 0,
        duration,
        delay,
        stagger,
        ease,
        scrollTrigger: {
          trigger: el,
          start: `top ${100 - threshold * 100}%`,
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, { scope: containerRef, dependencies });

  return containerRef;
};

export const useHover3D = (options = {}) => {
  const ref = useRef(null);
  const {
    intensity = 15,
    perspective = 1000,
    scale = 1.05,
    duration = 0.5,
    ease = 'power2.out',
  } = options;

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    const target = el.firstElementChild || el;
    let bounds = { left: 0, top: 0, width: 0, height: 0 };

    gsap.set(el, { perspective: perspective });
    gsap.set(target, { transformStyle: 'preserve-3d' });

    const onMouseEnter = () => {
      bounds = el.getBoundingClientRect();
    };

    const onMouseMove = (e) => {
      // Use cached bounds to avoid layout thrashing
      const x = (e.clientX - bounds.left) / bounds.width - 0.5;
      const y = (e.clientY - bounds.top) / bounds.height - 0.5;

      gsap.to(target, {
        rotationY: x * intensity,
        rotationX: -y * intensity,
        scale: scale,
        duration: duration,
        ease: ease,
      });
    };

    const onMouseLeave = () => {
      gsap.to(target, {
        rotationY: 0,
        rotationX: 0,
        scale: 1,
        duration: duration,
        ease: ease,
      });
    };

    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, { scope: ref });

  return ref;
};
