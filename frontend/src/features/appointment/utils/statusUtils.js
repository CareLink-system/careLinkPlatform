export const getStatusLabel = (s) => {
  return ['Scheduled', 'Confirmed', 'Cancelled', 'Completed', 'Rescheduled', 'NoShow'][s] || 'Unknown'
}

export const getStatusColor = (s) => {
  const map = {
    0: 'text-yellow-600',
    1: 'text-blue-600',
    2: 'text-red-600',
    3: 'text-green-600',
    4: 'text-purple-600',
    5: 'text-gray-500',
  }
  return map[s] || 'text-gray-400'
}