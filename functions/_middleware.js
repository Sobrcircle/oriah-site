const CANONICAL_HOST = 'joinoriah.com'
const REDIRECT_HOSTS = new Set([
  'www.joinoriah.com',
  'oriah.app',
  'www.oriah.app',
  'oriah-site.pages.dev',
])

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const hostname = url.hostname.toLowerCase()

  if (REDIRECT_HOSTS.has(hostname)) {
    const target = new URL(url.toString())
    target.hostname = CANONICAL_HOST
    return Response.redirect(target.toString(), 301)
  }

  return context.next()
}
