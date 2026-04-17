const PALETTE = [
  '#E8A838', // amber
  '#3B82F6', // blue
  '#22C55E', // green
  '#A855F7', // purple
  '#EF4444', // red
  '#06B6D4', // cyan
  '#F97316', // orange
  '#EC4899', // pink
]

export function getAvatarColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export function getInitials(userId: string): string {
  const parts = userId.trim().split(/[\s_-]/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return userId.slice(0, 2).toUpperCase()
}
