# Hero background renditions (placeholder)

> These are **placeholder** assets. The real "Molten Ink Under Glass" Blender
> fluid simulation (design §5) swaps in later as a binary-only commit, under
> these exact filenames. Same-origin only (CSP `default-src 'self'`).

## Files

| File | Codec | Role |
|------|-------|------|
| `hero-loop-1080.webm` | AV1 (libsvtav1) | primary desktop |
| `hero-loop-1080.mp4` | H.264 High (libx264, +faststart) | fallback desktop |
| `hero-loop-720.webm` | AV1 (libsvtav1) | mobile rendition (css-only tier) |
| `hero-loop-720.mp4` | H.264 High (libx264, +faststart) | mobile fallback |
| `hero-poster.avif` | AV1 still (libaom-av1) | SSR `<img>` poster / LCP (`next/image`) |
| `hero-poster.jpg` | JPEG | `<video poster>` attribute |

## Encoding matrix (placeholder generation)

Master: 8s / 192 frames @ 24fps, 1920x1080, near-void `#131313` field with two
slow drifting ember (`#ffb4a5`) / copper (`#e2725b`) radial glows in the
lower-right (design §1 art direction), gaussian-blurred and darkened.

```bash
# Master clip (dark void + drifting ember/copper filaments, lower-right)
ffmpeg -f lavfi -i "color=c=0x131313:s=1920x1080:r=24:d=8" \
  -f lavfi -i "gradients=s=1920x1080:r=24:d=8:c0=0x000000:c1=0xffb4a5:x0=1400:y0=820:x1=1920:y1=1080:type=radial:speed=0.04" \
  -f lavfi -i "gradients=s=1920x1080:r=24:d=8:c0=0x000000:c1=0xe2725b:x0=1650:y0=560:x1=1920:y1=900:type=radial:speed=0.025" \
  -filter_complex "[1]colorchannelmixer=aa=0.5,format=gbrp[g1];[2]colorchannelmixer=aa=0.35,format=gbrp[g2];[0][g1]blend=all_mode=screen[b1];[b1][g2]blend=all_mode=screen,gblur=sigma=42,eq=brightness=-0.12:saturation=1.1,format=yuv420p[m]" \
  -map "[m]" -frames:v 192 master.mp4

# 1080 renditions
ffmpeg -i master.mp4 -c:v libsvtav1 -crf 50 -preset 8 -g 48 -an hero-loop-1080.webm
ffmpeg -i master.mp4 -c:v libx264 -profile:v high -crf 30 -pix_fmt yuv420p -movflags +faststart -an hero-loop-1080.mp4

# 720 renditions
ffmpeg -i master.mp4 -vf scale=1280:720 -c:v libsvtav1 -crf 50 -preset 8 -g 48 -an hero-loop-720.webm
ffmpeg -i master.mp4 -vf scale=1280:720 -c:v libx264 -profile:v high -crf 30 -pix_fmt yuv420p -movflags +faststart -an hero-loop-720.mp4

# Poster (frame at t=6s, where filaments are most visible)
ffmpeg -ss 6 -i master.mp4 -frames:v 1 -c:v libaom-av1 -still-picture 1 -crf 40 hero-poster.avif
ffmpeg -ss 6 -i master.mp4 -frames:v 1 -q:v 4 hero-poster.jpg
```

Real asset note: CRF values here are intentionally high (small placeholder
files). Final Blender renditions use the design §5 ladder (AV1 CRF ~38 ≤2.5MB,
H.264 CRF ~23 ≤4MB) and re-pinned contrast timestamps for `hero.contrast.spec`.
