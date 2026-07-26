// Lazy loader voor OpenCV.js.
//
// OpenCV.js is groot (~8 MB), dus we laden het pas wanneer borddetectie nodig is.
// Faalt het laden (offline zonder cache), dan valt de pipeline terug op de
// handmatige uitlijning via het camerakader.

declare global {
  interface Window {
    cv?: any;
    Module?: any;
  }
}

const OPENCV_URL = 'https://docs.opencv.org/4.10.0/opencv.js';

let cvPromise: Promise<any> | null = null;

export function isOpenCVReady(): boolean {
  return typeof window !== 'undefined' && !!window.cv && !!window.cv.Mat;
}

/**
 * Laadt OpenCV.js en resolvet zodra het runtime-geïnitialiseerd is.
 * Retourneert het `cv`-object, of gooit bij een fout.
 */
export function loadOpenCV(url = OPENCV_URL): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('OpenCV kan alleen in de browser laden.'));
  }
  if (isOpenCVReady()) return Promise.resolve(window.cv);
  if (cvPromise) return cvPromise;

  cvPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('opencv-js') as HTMLScriptElement | null;

    const onReady = () => {
      const cv = window.cv;
      if (!cv) return reject(new Error('OpenCV geladen maar niet beschikbaar.'));
      // OpenCV meldt zich klaar via onRuntimeInitialized of is al klaar.
      if (cv.Mat) {
        resolve(cv);
      } else {
        cv.onRuntimeInitialized = () => resolve(cv);
      }
    };

    if (existing) {
      onReady();
      return;
    }

    const script = document.createElement('script');
    script.id = 'opencv-js';
    script.src = url;
    script.async = true;
    script.onload = onReady;
    script.onerror = () => {
      cvPromise = null;
      reject(new Error('Kon OpenCV.js niet laden (offline?).'));
    };
    document.body.appendChild(script);
  });

  return cvPromise;
}
