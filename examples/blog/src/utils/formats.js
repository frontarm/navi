export let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function formatDate(dateString) {
  let date = new Date(dateString)
  let monthName = months[date.getMonth()]
  let dayOfMonth = date.getDate()
  let fourDigitYear = date.getFullYear()

  return `${monthName} ${dayOfMonth}, ${fourDigitYear}`
}