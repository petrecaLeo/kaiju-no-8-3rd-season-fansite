export function buildRobotsTxt(site: URL): string {
  const sitemap = new URL('sitemap-index.xml', site);
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap.href}`, ''].join('\n');
}
