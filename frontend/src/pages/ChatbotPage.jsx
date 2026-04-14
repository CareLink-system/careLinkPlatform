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
import { normalizeGuidanceText } from '../lib/utils';

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
  const [renameConversationTarget, setRenameConversationTarget] = useState(null);
  const [renameConversationTitle, setRenameConversationTitle] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editMessageTarget, setEditMessageTarget] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState('');

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

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      setRenameConversationTarget(null);
      setDeleteTarget(null);
      setEditMessageTarget(null);
    };

    if (renameConversationTarget || deleteTarget || editMessageTarget) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }

    return undefined;
  }, [renameConversationTarget, deleteTarget, editMessageTarget]);

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
    setRenameConversationTarget(conversation);
    setRenameConversationTitle(conversation.title || 'CareLink Chat');
  };

  const submitRenameConversation = async (event) => {
    event.preventDefault();
    if (!renameConversationTarget || !renameConversationTitle.trim()) return;
    try {
      const updated = await updateChatConversation(renameConversationTarget.id, { title: renameConversationTitle.trim() });
      setConversations((prev) => prev.map((item) => (item.id === renameConversationTarget.id ? updated : item)));
      setRenameConversationTarget(null);
      setRenameConversationTitle('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to rename conversation.'));
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    const targetConversation = conversations.find((item) => item.id === conversationId);
    if (!targetConversation) return;
    setDeleteTarget({ type: 'conversation', item: targetConversation });
  };

  const confirmDeleteConversation = async () => {
    if (!deleteTarget || deleteTarget.type !== 'conversation') return;
    try {
      const conversationId = deleteTarget.item.id;
      await deleteChatConversation(conversationId);
      setConversations((prev) => prev.filter((item) => item.id !== conversationId));
      setMessages([]);
      const nextConversation = conversations.find((item) => item.id !== conversationId);
      setActiveConversationId(nextConversation?.id || '');
      setDeleteTarget(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete conversation.'));
    }
  };

  const handleEditMessage = async (message) => {
    setEditMessageTarget(message);
    setEditMessageContent(message.content || '');
  };

  const submitEditMessage = async (event) => {
    event.preventDefault();
    if (!editMessageTarget || !editMessageContent.trim()) return;
    try {
      const updated = await updateChatMessage(editMessageTarget.id, { content: editMessageContent.trim() });
      const refreshed = await getChatMessages(activeConversationId);
      setMessages(refreshed);
      setEditMessageTarget(null);
      setEditMessageContent('');
      setError(null);
      return updated;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update message.'));
    }
  };

  const handleDeleteMessage = async (message) => {
    setDeleteTarget({ type: 'message', item: message });
  };

  const confirmDeleteMessage = async () => {
    if (!deleteTarget || deleteTarget.type !== 'message') return;
    try {
      await deleteChatMessage(deleteTarget.item.id);
      const refreshed = await getChatMessages(activeConversationId);
      setMessages(refreshed);
      setDeleteTarget(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete message.'));
    }
  };

  const activeConversation = conversations.find((item) => item.id === activeConversationId);
  const insight = activeConversation?.diagnosis_context || diagnosisContext;
  const insightGuidance = normalizeGuidanceText(insight?.ai_feedback, 'Ask CareLink for next-step guidance.');
  const promptSuggestions = insight?.predicted_condition
    ? [
        `How can I manage ${insight.predicted_condition} at home?`,
        `What symptoms should I watch for with ${insight.predicted_condition}?`,
        'When should I see a doctor?'
      ]
    : [
        'What should I watch for next?',
        'How do I know if this is getting worse?',
        'Can you summarize the next steps?'
      ];

  const dialogLayer = renameConversationTarget || deleteTarget || editMessageTarget;

  return (
    <div className="min-h-[90vh] bg-[radial-gradient(circle_at_top_left,rgba(75,154,168,0.12),transparent_32%),linear-gradient(180deg,#f8fbfc_0%,#f4f8fb_100%)] px-4 py-6 text-slate-800 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-4xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between lg:p-7">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#4B9AA8]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#317885]">
              CareLink Chatbot
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Follow up on your diagnosis in one focused place.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Ask follow-up questions, capture changes in symptoms, and keep each conversation tied to the latest diagnosis insight.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => createNewConversation()}
              className="rounded-2xl bg-[#4B9AA8] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#4B9AA8]/20 transition hover:-translate-y-0.5 hover:bg-[#397a86]"
            >
              New Chat
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-6 rounded-4xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950">Chats</h2>
                  <p className="text-xs text-slate-500">{conversations.length} saved conversation{conversations.length === 1 ? '' : 's'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => createNewConversation()}
                  className="rounded-full border border-[#4B9AA8]/20 bg-[#4B9AA8]/8 px-3 py-2 text-xs font-bold text-[#317885] transition hover:border-[#4B9AA8]/40 hover:bg-[#4B9AA8]/12"
                >
                  + New
                </button>
              </div>

              {loadingConversations ? (
                <div className="space-y-3 py-4">
                  <div className="h-28 animate-pulse rounded-3xl bg-slate-100" />
                  <div className="h-28 animate-pulse rounded-3xl bg-slate-100" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-500">
                  No chats yet. Start a new one and CareLink will keep the conversation linked to your diagnosis.
                </div>
              ) : (
                <div className="max-h-[72vh] space-y-3 overflow-y-auto pr-1">
                  {conversations.map((conversation) => {
                    const isActive = conversation.id === activeConversationId;
                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => setActiveConversationId(conversation.id)}
                        className={`w-full rounded-3xl border p-4 text-left transition ${isActive ? 'border-[#4B9AA8]/60 bg-[#4B9AA8]/7 shadow-sm' : 'border-slate-200 bg-white hover:border-[#4B9AA8]/25 hover:bg-slate-50'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-extrabold text-slate-950">{conversation.title}</h3>
                            <p className="mt-1 text-xs text-slate-500">{conversation.message_count || 0} messages</p>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {conversation.updated_at ? new Date(conversation.updated_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(event) => { event.stopPropagation(); handleRenameConversation(conversation); }}
                            className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200"
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={(event) => { event.stopPropagation(); handleDeleteConversation(conversation.id); }}
                            className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            {insight && (
              <section className="rounded-4xl border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#317885]">Latest diagnosis insight</p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      {insight.predicted_condition || 'CareLink insight'}
                    </h2>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                    {Math.round((insight.confidence || 0) * 100)}% confidence
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-3xl bg-slate-50 p-4 md:col-span-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Specialty</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{insight.recommended_specialty || 'General Physician'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 md:col-span-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Guidance</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {insightGuidance}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="overflow-hidden rounded-4xl border border-slate-200/70 bg-white/85 shadow-[0_22px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Conversation</p>
                  <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                    {activeConversation?.title || 'Select or create a chat'}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeConversation?.id && (
                    <button
                      type="button"
                      onClick={() => handleRenameConversation(activeConversation)}
                      className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      Rename chat
                    </button>
                  )}
                  <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
                    {loadingMessages ? 'Refreshing messages...' : `${messages.length} message${messages.length === 1 ? '' : 's'}`}
                  </span>
                </div>
              </div>

              <div className="bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(241,245,249,0.8))] px-4 py-5 sm:px-6">
                <div className="mb-4 flex flex-wrap gap-2">
                  {promptSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setMessageText(suggestion)}
                      className="rounded-full border border-[#4B9AA8]/15 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#4B9AA8]/35 hover:text-[#317885]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="max-h-[58vh] space-y-4 overflow-y-auto pr-1">
                  {loadingMessages ? (
                    <div className="py-16 text-center text-slate-400">Loading chat...</div>
                  ) : messages.length === 0 ? (
                    <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white/90 p-8 text-center text-slate-500">
                      <p className="text-base font-semibold text-slate-700">
                        {activeConversationId ? 'Ask your first follow-up question below.' : 'Create a conversation to begin chatting with CareLink.'}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Try asking about red flags, home care, or what to do next based on your diagnosis.
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isUser = message.sender === 'user';
                      return (
                        <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[92%] rounded-[1.75rem] px-4 py-3 shadow-sm sm:max-w-[82%] ${isUser ? 'bg-[#4B9AA8] text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
                            <div className="mb-2 flex items-center justify-between gap-4">
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-75">
                                {isUser ? 'You' : 'CareLink'}
                              </span>
                              <span className="text-[10px] opacity-60">
                                {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                            {isUser && (
                              <div className="mt-3 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditMessage(message)}
                                  className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold transition hover:bg-white/25"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMessage(message)}
                                  className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold transition hover:bg-white/25"
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
              </div>

              <form onSubmit={handleSend} className="border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
                {error && (
                  <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Ask CareLink something about your diagnosis, symptoms, or next steps..."
                    rows={3}
                    className="min-h-23 flex-1 resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#4B9AA8] focus:ring-4 focus:ring-[#4B9AA8]/10"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className={`rounded-3xl px-6 py-3 text-sm font-bold text-white transition ${sending || !messageText.trim() ? 'cursor-not-allowed bg-slate-300' : 'bg-[#4B9AA8] hover:-translate-y-0.5 hover:bg-[#397a86]'}`}
                  >
                    {sending ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </form>
            </section>
          </main>
        </div>
      </div>

      {dialogLayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm" onClick={() => {
          setRenameConversationTarget(null);
          setDeleteTarget(null);
          setEditMessageTarget(null);
        }}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="chatbot-dialog-title"
            className="w-full max-w-lg rounded-4xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {renameConversationTarget && (
              <form onSubmit={submitRenameConversation} className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#317885]">Rename chat</p>
                  <h3 id="chatbot-dialog-title" className="mt-1 text-2xl font-black tracking-tight text-slate-950">Update conversation title</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Give this conversation a clearer name so it is easier to find later.
                  </p>
                </div>

                <label className="block text-sm font-semibold text-slate-700">
                  Title
                  <input
                    autoFocus
                    value={renameConversationTitle}
                    onChange={(event) => setRenameConversationTitle(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#4B9AA8] focus:ring-4 focus:ring-[#4B9AA8]/10"
                    placeholder="Conversation title"
                  />
                </label>

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRenameConversationTarget(null)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl bg-[#4B9AA8] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#397a86]"
                  >
                    Save title
                  </button>
                </div>
              </form>
            )}

            {editMessageTarget && (
              <form onSubmit={submitEditMessage} className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#317885]">Edit message</p>
                  <h3 id="chatbot-dialog-title" className="mt-1 text-2xl font-black tracking-tight text-slate-950">Update your message</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Make your message clearer before sending it back into the conversation.
                  </p>
                </div>

                <label className="block text-sm font-semibold text-slate-700">
                  Message
                  <textarea
                    autoFocus
                    rows={5}
                    value={editMessageContent}
                    onChange={(event) => setEditMessageContent(event.target.value)}
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#4B9AA8] focus:ring-4 focus:ring-[#4B9AA8]/10"
                  />
                </label>

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditMessageTarget(null)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl bg-[#4B9AA8] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#397a86]"
                  >
                    Save message
                  </button>
                </div>
              </form>
            )}

            {deleteTarget && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">Confirm delete</p>
                  <h3 id="chatbot-dialog-title" className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                    Delete {deleteTarget.type === 'conversation' ? 'conversation' : 'message'}?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    This action cannot be undone.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  {deleteTarget.type === 'conversation'
                    ? deleteTarget.item.title
                    : deleteTarget.item.content}
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={deleteTarget.type === 'conversation' ? confirmDeleteConversation : confirmDeleteMessage}
                    className="rounded-2xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
