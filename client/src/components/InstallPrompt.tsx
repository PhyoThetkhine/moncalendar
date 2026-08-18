import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show our custom install banner
      setShowPrompt(true);
    };

    // Listen for the event
    window.addEventListener("beforeinstallprompt", handler);

    // If already installed, hide it
    window.addEventListener("appinstalled", () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the native browser install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="bg-zinc-900 text-white px-4 py-2.5 flex items-center justify-between text-sm shadow-md sticky top-0 left-0 right-0 z-[100]">
      <div className="flex items-center gap-3">
        <div className="bg-zinc-800 p-1.5 rounded-md">
          <Download size={16} className="text-zinc-300" />
        </div>
        <span className="font-medium tracking-wide">Install Mon Calendar App</span>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleInstallClick} 
          className="bg-white text-zinc-900 px-3 py-1.5 rounded-md font-semibold text-xs hover:bg-zinc-200 transition-colors"
        >
          Install
        </button>
        <button onClick={() => setShowPrompt(false)} aria-label="Dismiss" className="p-1 hover:bg-zinc-800 rounded-full transition-colors">
          <X size={16} className="text-zinc-400 hover:text-white" />
        </button>
      </div>
    </div>
  );
}
