import React from 'react'

export default function Card({ children }) {
  return (
    <div className="max-w-xl w-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      {children}
    </div>
  )
}
