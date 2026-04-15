import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5000'
const CHATBOT_BASE = `${API_BASE_URL.replace(/\/$/, '')}/api/chatbot`

export async function createChatConversation(payload) {
  const res = await axios.post(`${CHATBOT_BASE}/conversations`, payload)
  return res.data
}

export async function getChatConversations(userId) {
  const res = await axios.get(`${CHATBOT_BASE}/conversations`, {
    params: { user_id: userId }
  })
  return res.data || []
}

export async function getChatConversationById(conversationId) {
  const res = await axios.get(`${CHATBOT_BASE}/conversations/${conversationId}`)
  return res.data
}

export async function updateChatConversation(conversationId, payload) {
  const res = await axios.put(`${CHATBOT_BASE}/conversations/${conversationId}`, payload)
  return res.data
}

export async function deleteChatConversation(conversationId) {
  const res = await axios.delete(`${CHATBOT_BASE}/conversations/${conversationId}`)
  return res.data
}

export async function getChatMessages(conversationId) {
  const res = await axios.get(`${CHATBOT_BASE}/conversations/${conversationId}/messages`)
  return res.data || []
}

export async function sendChatMessage(conversationId, payload) {
  const res = await axios.post(`${CHATBOT_BASE}/conversations/${conversationId}/messages`, payload)
  return res.data
}

export async function updateChatMessage(messageId, payload) {
  const res = await axios.put(`${CHATBOT_BASE}/messages/${messageId}`, payload)
  return res.data
}

export async function deleteChatMessage(messageId) {
  const res = await axios.delete(`${CHATBOT_BASE}/messages/${messageId}`)
  return res.data
}
