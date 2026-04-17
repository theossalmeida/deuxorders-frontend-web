// Resolve a backend-supplied reference to an absolute URL safe for <img>.
// Only accepts http(s) absolutes; anything else is prefixed with the API base.
// A substring check on "http" would accept values like `httpjavascript:...` that
// the browser silently ignores — keep the regex.
export function buildRefSrc(ref: string): string {
  if (/^https?:\/\//i.test(ref)) return ref;
  return `${process.env.NEXT_PUBLIC_API_URL}/${ref}`;
}
