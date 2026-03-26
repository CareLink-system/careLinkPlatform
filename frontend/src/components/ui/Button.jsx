import React from 'react'

export default function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-md bg-accent text-white hover:opacity-90"
    >
      {children}
    </button>
  )
}
