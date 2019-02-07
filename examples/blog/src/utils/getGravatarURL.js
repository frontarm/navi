import md5 from 'blueimp-md5'

export function getGravatarURL({ email, size, defaultURL = 'identicon' }) {
  let hash = md5(email.toLowerCase().trim())
  return `https://www.gravatar.com/avatar/${hash}.jpg?s=${size}&d=${encodeURIComponent(defaultURL)}`
}
