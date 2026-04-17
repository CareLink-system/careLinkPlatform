import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

function stripCodeFence(text) {
  return text
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
}

function renderGuidanceObject(value) {
  if (!value || typeof value !== 'object') {
    return ''
  }

  const possibleMeaning = value.possible_meaning || value.possibleMeaning || value.summary || value.guidance
  const whatToDo = value.what_to_do || value.whatToDo || value.steps || value.recommendations
  const redFlags = value.red_flags || value.redFlags || value.warning_signs || value.warnings

  const sections = []

  if (typeof possibleMeaning === 'string' && possibleMeaning.trim()) {
    sections.push(possibleMeaning.trim())
  }

  if (Array.isArray(whatToDo) && whatToDo.length > 0) {
    sections.push(`What to do:\n${whatToDo.map((item) => `- ${String(item).trim()}`).join('\n')}`)
  } else if (typeof whatToDo === 'string' && whatToDo.trim()) {
    sections.push(`What to do:\n${whatToDo.trim()}`)
  }

  if (Array.isArray(redFlags) && redFlags.length > 0) {
    sections.push(`Seek urgent care if:\n${redFlags.map((item) => `- ${String(item).trim()}`).join('\n')}`)
  } else if (typeof redFlags === 'string' && redFlags.trim()) {
    sections.push(`Seek urgent care if:\n${redFlags.trim()}`)
  }

  if (sections.length > 0) {
    return sections.join('\n\n')
  }

  return ''
}

export function normalizeGuidanceText(rawGuidance, fallbackText = '') {
  if (rawGuidance == null) {
    return fallbackText
  }

  if (typeof rawGuidance === 'object') {
    return renderGuidanceObject(rawGuidance) || fallbackText
  }

  if (typeof rawGuidance !== 'string') {
    return fallbackText || String(rawGuidance)
  }

  const trimmed = rawGuidance.trim()
  if (!trimmed) {
    return fallbackText
  }

  const unfenced = stripCodeFence(trimmed)
  try {
    const parsed = JSON.parse(unfenced)
    if (typeof parsed === 'string') {
      return parsed.trim() || fallbackText
    }

    return renderGuidanceObject(parsed) || unfenced
  } catch {
    return unfenced
  }
}
