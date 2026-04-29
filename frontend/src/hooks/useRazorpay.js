/**
 * useRazorpay.js
 * Dynamically loads the Razorpay checkout script exactly once.
 * Returns { isLoaded, isError }.
 */

import { useState, useEffect } from "react";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise = null; // singleton — only one load attempt across the app

function loadScript() {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script    = document.createElement("script");
    script.src      = RAZORPAY_SCRIPT_URL;
    script.async    = true;
    script.onload   = () => resolve(true);
    script.onerror  = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

/**
 * @returns {{ isLoaded: boolean, isError: boolean }}
 */
export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(!!window.Razorpay);
  const [isError,  setIsError]  = useState(false);

  useEffect(() => {
    if (isLoaded) return;

    loadScript()
      .then(() => setIsLoaded(true))
      .catch(() => {
        scriptPromise = null; // allow retry
        setIsError(true);
      });
  }, [isLoaded]);

  return { isLoaded, isError };
}