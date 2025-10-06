import { useEffect, useState } from "react";
import styles from "../styles/components.module.css";

export default function InstallPWA() {
  
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {

    //verifica se navegador é iOS
    if (typeof navigator !== "undefined") {
      setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
    }
    
    //verifica se já há um app instalado
    const handleBeforeInstallPrompt = (e: Event) => {
      // console.log(e)
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      setDeferredPrompt(null);
      setIsInstallable(false);
      console.log(`User response to the install prompt: ${outcome}`);
    }
  };

  // console.log(isUpdateAvailable)

  if (isStandalone) {
    return null; // App já instalado
  }

  return (
    <div>
      {/* Chromium e outros browsers que suportam beforeinstallprompt */}
      {isInstallable && (
        <button 
          onClick={handleInstallClick}
          className={styles.install_button}
        >
          Instalar app
        </button>
      )}
    </div>
  );
}