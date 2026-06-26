"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap };

export function useGsapCountUp(ref: React.RefObject<HTMLSpanElement | null>, target: number, deps: unknown[] = []) {
  useEffect(() => {
    if (!ref.current) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ref.current.textContent = target.toLocaleString("en-BD");
      return;
    }
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: "power2.out",
      snap: { val: 1 },
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.val).toLocaleString("en-BD");
      },
    });
  }, deps);
}

export function useGsapFadeIn(ref: React.RefObject<HTMLDivElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    if (!ref.current) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(ref.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
  }, deps);
}

export function useGsapStagger(ref: React.RefObject<HTMLDivElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    if (!ref.current) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const children = ref.current.querySelectorAll("[data-stagger]");
    if (children.length === 0) return;
    gsap.fromTo(children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power1.out" });
  }, deps);
}
