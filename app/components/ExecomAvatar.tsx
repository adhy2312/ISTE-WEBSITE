import { urlForImage } from '@/lib/sanity/image'

interface SanityImage {
  asset: { _ref?: string; url?: string; _id?: string }
  hotspot?: { x: number; y: number; width: number; height: number }
  crop?: { top: number; bottom: number; left: number; right: number }
}

interface ExecomAvatarProps {
  photo?: SanityImage | null
  // Legacy plain URL fallback (for hardcoded data)
  photoUrl?: string | null
  initials: string
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export default function ExecomAvatar({ photo, photoUrl, initials, name, size = 'md' }: ExecomAvatarProps) {
  const px = size === 'sm' ? 120 : size === 'lg' ? 280 : 200

  // Build URL from full Sanity image object (respects crop + hotspot)
  let imgUrl: string | null = null
  if (photo?.asset) {
    try {
      imgUrl = urlForImage(photo)
        .width(px)
        .height(px)
        .fit('crop')     // applies the crop rectangle
        .auto('format')  // WebP where supported
        .url()
    } catch {
      imgUrl = photo.asset.url || null
    }
  } else if (photoUrl) {
    // Fallback for any raw URL (e.g. hardcoded data)
    imgUrl = `${photoUrl}?w=${px}&h=${px}&fit=crop&auto=format`
  }

  if (imgUrl) {
    return (
      <div className={`execom-avatar execom-avatar--photo execom-avatar--${size}`}>
        <img src={imgUrl} alt={name} />
      </div>
    )
  }

  // Placeholder — person silhouette + initials
  return (
    <div className={`execom-avatar execom-avatar--placeholder execom-avatar--${size}`} title="Upload photo in Sanity Studio">
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="40" cy="30" r="16" fill="currentColor" opacity="0.6" />
        <path d="M10 72c0-16.569 13.431-30 30-30s30 13.431 30 30" fill="currentColor" opacity="0.45" />
      </svg>
      <span className="execom-avatar__initials">{initials}</span>
    </div>
  )
}
