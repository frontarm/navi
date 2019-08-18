import React from 'react'
import md5 from 'blueimp-md5'
import { Omit } from '../types/Omit'

interface GravatarOptions {
  email: string
  size: string | number
  defaultURL?: string
}

function getGravatarURL({
  email,
  size,
  defaultURL = 'identicon',
}: GravatarOptions) {
  let hash = md5(email.toLowerCase().trim())
  return `https://www.gravatar.com/avatar/${hash}.jpg?s=${size}&d=${encodeURIComponent(
    defaultURL,
  )}`
}

export interface GravatarProps
  extends GravatarOptions,
    Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {}

export default function Gravatar({
  email,
  size,
  defaultURL,
  ...imgProps
}: GravatarProps) {
  return <img src={getGravatarURL({ email, size, defaultURL })} {...imgProps} alt={imgProps.alt}/>
}
