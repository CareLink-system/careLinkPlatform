import React, { useEffect, useState } from 'react';
import {
  createChatConversation,
  getChatConversations,
  getChatMessages,
  sendChatMessage,
  updateChatConversation,
  deleteChatConversation,
  updateChatMessage,
  deleteChatMessage
} from '../api/chatbot';

export default function ChatbotPage() {
  const getErrorMessage = (err, fallback) => (
    err?.response?.data?.detail
    || err?.response?.data?.message
    || err?.message
    || fallback
  );

  const getUserId = () => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem('carelink.auth'));
      if (storedAuth?.user?.id) return storedAuth.user.id;
    } catch {
      // ignore
    }

    try {
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser?.id) return localUser.id;
    } catch {
      // ignore
    }

    return localStorage.getItem('user_id') || 'unknown_user';
  };

  const userId = getUserId();
  const [diagnosisContext, setDiagnosisContext] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const readDiagnosisContext = () => {
    try {
      const raw = localStorage.getItem('carelink.lastDiagnosis');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const loadConversations = async () => {
    if (userId === 'unknown_user') {
      setLoadingConversations(false);
      return;
    }

    setLoadingConversations(true);
    try {
      const latestDiagnosis = readDiagnosisContext();
      setDiagnosisContext(latestDiagnosis);
      const list = await getChatConversations(userId);
      setConversations(list);
      const storedActive = localStorage.getItem('carelink.activeChatConversationId');
      const nextActive = list.find((item) => item.id === storedActive) || list[0];
      if (nextActive?.id) {
        setActiveConversationId(nextActive.id);
      } else if (list.length === 0 && latestDiagnosis) {
        await createNewConversation(latestDiagnosis);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load conversations.'));
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;
    setLoadingMessages(true);
    try {
      const data = await getChatMessages(conversationId);
      setMessages(data);
      const active = conversations.find((item) => item.id === conversationId);
      setDiagnosisContext(active?.diagnosis_context || diagnosisContext);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load messages.'));
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    setDiagnosisContext(readDiagnosisContext());
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem('carelink.activeChatConversationId', activeConversationId);
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  const createNewConversation = async (contextOverride = diagnosisContext) => {
    if (userId === 'unknown_user') {
      setError('You must be logged in to use the chatbot.');
      return;
    }

    try {
      const payload = {
        user_id: userId,
        title: contextOverride?.predicted_condition ? `Chat about ${contextOverride.predicted_condition}` : 'CareLink Chat',
        diagnosis_context: contextOverride
      };
      const conversation = await createChatConversation(payload);
      setConversations((prev) => [conversation, ...prev]);
      setActiveConversationId(conversation.id);
      setMessages([]);
      return conversation;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create conversation.'));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    setError(null);
    try {
      let convId = activeConversationId;
      if (!convId) {
        const created = await createNewConversation();
        convId = created?.id;
        if (!convId) {
          throw new Error('Unable to create conversation');
        }
      }

      const data = await sendChatMessage(convId, {
        user_id: userId,
        content: messageText.trim()
      });
      setMessages((prev) => [...prev, data.user_message, data.assistant_message]);
      setMessageText('');
      setConversations((prev) => prev.map((item) => (
        item.id === convId ? { ...item, updated_at: new Date().toISOString() } : item
      )));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send message.'));
    } finally {
      setSending(false);
    }
  };

  const handleRenameConversation = async (conversation) => {
    const nextTitle = window.prompt('Rename conversation', conversation.title || 'CareLink Chat');
    if (nextTitle === null || !nextTitle.trim()) return;
    try {
      const updated = await updateChatConversation(conversation.id, { title: nextTitle.trim() });
      setConversations((prev) => prev.map((item) => (item.id === conversation.id ? updated : item)));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to rename conversation.'));
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteChatConversation(conversationId);
      setConversations((prev) => prev.filter((item) => item.id !== conversationId));
      setMessages([]);
      const nextConversation = conversations.find((item) => item.id !== conversationId);
      setActiveConversationId(nextConversation?.id || '');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete conversation.'));
    }
  };

  const handleEditMessage = async (message) => {
    const nextContent = window.prompt('Edit your message', message.content || '');
    if (nextContent === null || !nextContent.trim()) return;
    try {
      const updated = await updateChatMessage(message.id, { content: nextContent.trim() });
      const refreshed = await getChatMessages(activeConversationId);
      setMessages(refreshed);
      setError(null);
      return updated;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update message.'));
    }
  };

  const handleDeleteMessage = async (message) => {
    try {
      await deleteChatMessage(message.id);
      const refreshed = await getChatMessages(activeConversationId);
      setMessages(refreshed);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete message.'));
    }
  };

  const activeConversation = conversations.find((item) => item.id === activeConversationId);
  const insight = activeConversation?.diagnosis_context || diagnosisContext;

  return (
    <div className="min-h-[90vh] bg-slate-50/50 p-4 lg:p-8 text-slate-800">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">CareLink Chatbot</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Ask follow-up questions, get symptom insights, and keep the conversation tied to your latest diagnosis.
          </p>
        </div>
        <button
          type="button"
          onClick={createNewConversation}
          className="self-start rounded-2xl bg-[#4B9AA8] px-5 py-3 text-sm font-bold text-white hover:bg-[#397a86]"
        >
          New Chat
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-4 xl:col-span-3 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Chats</h2>
            <span className="text-xs font-semibold text-slate-500">{conversations.length} items</span>
          </div>

          {loadingConversations ? (
            <div className="py-10 text-center text-slate-400">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              No conversations yet. Start a new chat and ask CareLink a question.
            </div>
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {conversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${isActive ? 'border-[#4B9AA8] bg-[#4B9AA8]/5' : 'border-slate-200 bg-white hover:border-[#4B9AA8]/30'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900">{conversation.title}</h3>
                        <p className="mt-1 text-xs text-slate-500">{conversation.message_count || 0} messages</p>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {conversation.updated_at ? new Date(conversation.updated_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600"
                        onClick={(event) => { event.stopPropagation(); handleRenameConversation(conversation); }}
                      >
                        Rename
                      </span>
                      <span
                        className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-600"
                        onClick={(event) => { event.stopPropagation(); handleDeleteConversation(conversation.id); }}
                      >
                        Delete
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <main className="lg:col-span-8 xl:col-span-9 space-y-6">
          {insight && (
            <section className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#4B9AA8]">Latest Diagnosis Insight</p>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {insight.predicted_condition || 'CareLink insight'}
                  </h2>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                  {Math.round((insight.confidence || 0) * 100)}% confidence
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-700">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Specialty</p>
                  <p className="font-semibold">{insight.recommended_specialty || 'General Physician'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Guidance</p>
                  <p className="leading-relaxed whitespace-pre-wrap">{insight.ai_feedback || 'Ask CareLink for next-step guidance.'}</p>
                </div>
              </div>
            </section>
          )}

          <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Conversation</p>
                <h2 className="text-lg font-bold text-slate-900">{activeConversation?.title || 'Select or create a chat'}</h2>
              </div>
              {activeConversation?.id && (
                <button
                  type="button"
                  onClick={() => handleRenameConversation(activeConversation)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Rename
                </button>
              )}
            </div>

            <div className="max-h-[62vh] overflow-y-auto px-6 py-6 space-y-4 bg-slate-50/60">
              {loadingMessages ? (
                <div className="py-16 text-center text-slate-400">Loading chat...</div>
              ) : messages.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
                  {activeConversationId
                    ? 'Start the conversation by sending a message below.'
                    : 'Create a conversation to begin chatting with CareLink.'}
                </div>
              ) : (
                messages.map((message) => {
                  const isUser = message.sender === 'user';
                  return (
                    <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-3xl px-4 py-3 shadow-sm ${isUser ? 'bg-[#4B9AA8] text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                            {isUser ? 'You' : 'CareLink'}
                          </span>
                          <span className="text-[10px] opacity-60">
                            {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                        {isUser && (
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditMessage(message)}
                              className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold hover:bg-white/25"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(message)}
                              className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold hover:bg-white/25"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} className="border-t border-slate-100 bg-white px-4 py-4">
              {error && (
                <div className="mb-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <div className="flex items-end gap-3">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Ask CareLink something about your diagnosis, symptoms, or next steps..."
                  rows={3}
                  className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#4B9AA8] focus:ring-4 focus:ring-[#4B9AA8]/10"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className={`rounded-2xl px-5 py-3 text-sm font-bold text-white ${sending || !messageText.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#4B9AA8] hover:bg-[#397a86]'}`}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
