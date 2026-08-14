import { useState } from 'react';

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export default function SafeImage({ src, alt, className, fallback }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return fallback ? <>{fallback}</> : (
      <div className={`bg-[#F5DEB3] flex items-center justify-center ${className || ''}`}>
        <span className="text-[#A0522D]/50 text-xs text-center p-2">No image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
