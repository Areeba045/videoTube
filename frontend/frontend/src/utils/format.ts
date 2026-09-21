export function formatViews(views: number): string {
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return views.toString();
}

export function formatSubscribers(subs: number): string {
  if (subs >= 1_000_000) {
    return `${(subs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M subscribers`;
  }
  if (subs >= 1_000) {
    return `${(subs / 1_000).toFixed(1).replace(/\.0$/, '')}K subscribers`;
  }
  return `${subs} subscribers`;
}
