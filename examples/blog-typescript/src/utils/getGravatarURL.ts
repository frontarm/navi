import md5 from 'blueimp-md5'

interface GravatarOptions {
  email: string,
  size: number,
  defaultURL?: string,
}

export function getGravatarURL({ email, size, defaultURL = 'identicon' }: GravatarOptions) {
  let hash = md5(email.toLowerCase().trim())
  return `https://www.gravatar.com/avatar/${hash}.jpg?s=${size}&d=${encodeURIComponent(defaultURL)}`
}
