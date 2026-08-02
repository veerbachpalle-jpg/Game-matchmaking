import { useEffect, useRef, useState } from "react";

export default function IntroVideo({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hasError, setHasError] = useState(false);

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(onDone, 700);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Autoplay was prevented or video failed to play:", err);
      });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleError = () => {
    console.error("Intro video failed to load. Ensure intro.mp4 exists in the public/ directory.");
    setHasError(true);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] bg-background transition-opacity duration-700 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      {!hasError ? (
        <video
          ref={videoRef}
          src="/intro.mp4"
          className="h-full w-full object-cover"
          autoPlay
          muted={muted}
          playsInline
          onEnded={finish}
          onError={handleError}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center p-6 z-10 relative">
          <div className="font-mono text-sm uppercase tracking-widest text-destructive">
            Intro Video Not Found
          </div>
          <p className="max-w-md text-xs text-muted-foreground">
            Please place your <code className="text-foreground font-semibold">intro.mp4</code> file inside the{" "}
            <code className="text-foreground font-semibold">public/</code> directory.
          </p>
          <button
            onClick={finish}
            className="clip-blade bg-primary px-6 py-2.5 font-display text-xs font-bold uppercase tracking-[0.25em] text-primary-foreground transition-transform hover:scale-105"
          >
            Continue to Site
          </button>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 scanlines" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />

      <div className="absolute left-6 top-6 flex items-center gap-3 z-10">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Nexus Arena · Booting
        </span>
      </div>

      <div className="absolute bottom-8 right-6 flex items-center gap-3 z-10">
        {!hasError && (
          <button
            onClick={() => setMuted((m) => !m)}
            className="clip-blade panel px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground transition-colors hover:text-accent"
          >
            {muted ? "Unmute" : "Mute"}
          </button>
        )}
        <button
          onClick={finish}
          className="clip-blade bg-primary px-6 py-2.5 font-display text-xs font-bold uppercase tracking-[0.25em] text-primary-foreground transition-transform hover:scale-105"
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
}

