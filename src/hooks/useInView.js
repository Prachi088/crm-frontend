// hooks/useInView.js
import { useEffect, useRef, useState } from "react";

/**
 * Returns [ref, isVisible].
 * @param {Object} opts
 * @param {number}  opts.threshold  - 0–1, fraction visible to trigger (default 0.15)
 * @param {boolean} opts.once       - if true, never un-triggers (default true)
 * @param {string}  opts.rootMargin - margin around root (default "0px 0px -60px 0px")
 */
export function useInView({
  threshold = 0.15,
  once = true,
  rootMargin = "0px 0px -60px 0px",
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return [ref, isVisible];
}

/**
 * Like useInView but also returns per-item stagger delays.
 * Returns [ref, isVisible, getDelay(index)]
 * @param {number} count       - number of items to stagger
 * @param {number} staggerMs   - delay between each item in ms (default 80)
 */
export function useStagger(count, staggerMs = 80) {
  const [ref, isVisible] = useInView({ threshold: 0.1 });
  const getDelay = (i) => `${i * staggerMs}ms`;
  return [ref, isVisible, getDelay];
}