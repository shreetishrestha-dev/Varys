import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs) => {
  return twMerge(clsx(inputs))
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case "positive":
      return "bg-green-100 text-green-800"
    case "negative":
      return "bg-red-100 text-red-800"
    case "neutral":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
