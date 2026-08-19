"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, MessageSquareText, Mail, Phone, ChevronDown, ChevronUp, LifeBuoy, FileText, Plus, X, Send, MoreVertical, Edit2, Quote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getSupportTickets, createSupportTicket, SupportTicket } from "@/lib/api/supportApi";
import { AnimatePresence, motion } from "framer-motion";
import Swal from "sweetalert2";
import { useRef } from "react";
import { io, Socket } from 'socket.io-client';
import { apiClient } from "@/lib/apiClient";

const faqs = [
  { question: "How do I track my baby's growth?", answer: "You can track your baby's growth by navigating to the Growth Tracker section." },
  { question: "Where can I find my order history?", answer: "Your past and current orders are available in the 'Orders' section." },
  { question: "How do I book a consultation with a doctor?", answer: "Go to the 'Doctor' section, select a specialist, pick a time slot." },
  { question: "Can I manage multiple baby profiles?", answer: "Currently, our platform supports one primary baby profile per account." },
  { question: "How secure are my health records?", answer: "All your health records are encrypted and securely stored." }
];

export default function HelpSupportPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [totalTicketsCount, setTotalTicketsCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketIssueType, setTicketIssueType] = useState<SupportTicket['issueType']>('other');
  const [ticketDesc, setTicketDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat State
  const [selectedChatTicket, setSelectedChatTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [quotingReplyId, setQuotingReplyId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize Socket Connection
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
    const newSocket = io(backendUrl, { auth: { token } });
    setSocket(newSocket);

    return () => { newSocket.close(); };
  }, []);

  // Listen for live ticket replies
  useEffect(() => {
    if (!socket) return;
    const handleTicketReply = (updatedTicket: SupportTicket) => {
      setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
      setSelectedChatTicket(prev => (prev && prev._id === updatedTicket._id) ? updatedTicket : prev);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    socket.on('ticket_reply', handleTicketReply);
    
    // Join room on reconnect if chat is open
    const handleConnect = () => {
      if (selectedChatTicket?._id) {
        socket.emit('join_ticket_room', selectedChatTicket._id);
      }
    };
    socket.on('connect', handleConnect);
    
    return () => { 
      socket.off('ticket_reply', handleTicketReply); 
      socket.off('connect', handleConnect);
    };
  }, [socket, selectedChatTicket?._id]);

  // Join the ticket room whenever a chat is opened
  useEffect(() => {
    if (socket && socket.connected && selectedChatTicket?._id) {
      socket.emit('join_ticket_room', selectedChatTicket._id);
    }
  }, [socket, selectedChatTicket?._id]);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchTickets(1, false);
  }, []);

  const fetchTickets = async (pageNum: number = 1, isLoadMore: boolean = false) => {
    if (isLoadMore) setIsLoadingMore(true);
    try {
      const { tickets: newTickets, count } = await getSupportTickets(pageNum, 5);
      setTotalTicketsCount(count);
      if (isLoadMore) {
        setTickets(prev => [...prev, ...newTickets]);
      } else {
        setTickets(newTickets || []);
      }
    } catch (e) { 
    } finally {
      if (isLoadMore) setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTickets(nextPage, true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const getQuotedMessage = (replyId: string) => {
    if (!selectedChatTicket) return null;
    return selectedChatTicket.replies?.find(r => r._id === replyId);
  };

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.transition = 'filter 0.3s ease';
      el.style.filter = 'brightness(0.7)';
      setTimeout(() => {
        el.style.filter = 'none';
      }, 1000);
    }
  };

  const handleCreateTicket = async () => {
    if (ticketDesc.trim().length < 10) {
      Swal.fire("Error", "Description must be at least 10 characters long.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await createSupportTicket({
        issueType: ticketIssueType,
        description: ticketDesc,
      });
      Swal.fire("Success", "Support ticket created successfully.", "success");
      setShowTicketModal(false);
      setTicketDesc("");
      setPage(1);
      fetchTickets(1, false);
    } catch (e) {
      Swal.fire("Error", "Failed to create ticket.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (reply: any) => {
    setEditingReplyId(reply._id);
    setReplyMessage(reply.message);
    setQuotingReplyId(null);
    setOpenDropdownId(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const startQuoting = (reply: any) => {
    setQuotingReplyId(reply._id);
    setEditingReplyId(null);
    setOpenDropdownId(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!selectedChatTicket) return;
    const result = await Swal.fire({
      title: 'Delete Message?',
      text: 'Are you sure you want to delete this message?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/support/${selectedChatTicket._id}/reply/${replyId}`);
        setOpenDropdownId(null);
      } catch (error) {
        console.error("Delete reply error:", error);
        Swal.fire('Error', 'Failed to delete message', 'error');
      }
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatTicket || !replyMessage.trim() || !selectedChatTicket._id) return;
    setIsReplying(true);

    if (editingReplyId) {
      try {
        await apiClient.put(`/support/${selectedChatTicket._id}/reply/${editingReplyId}`, {
          message: replyMessage
        });
        setEditingReplyId(null);
        setReplyMessage("");
      } catch (error: any) {
        console.error("Edit reply error:", error);
        Swal.fire("Error", "Failed to edit reply.", "error");
      }
      setIsReplying(false);
      return;
    }

    try {
      if (socket) {
        socket.emit('send_reply', { 
          ticketId: selectedChatTicket._id, 
          message: replyMessage,
          quotedReplyId: quotingReplyId 
        });
        setReplyMessage("");
        setQuotingReplyId(null);
        setTimeout(() => {
          textareaRef.current?.focus();
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        Swal.fire("Error", "Chat connection lost. Please refresh.", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Failed to send reply.", "error");
    } finally {
      setIsReplying(false);
    }
  };

  useEffect(() => {
    const ticketId = selectedChatTicket?._id;
    if (!socket || !ticketId) return;

    const handleConnect = () => {
      socket.emit('join_ticket_room', ticketId);
    };
    
    socket.on('connect', handleConnect);
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [socket, selectedChatTicket?._id]);

  useEffect(() => {
    if (selectedChatTicket) {
      setTimeout(() => chatEndRef.current?.scrollIntoView(), 100);
      
      if (socket && selectedChatTicket._id) {
        const hasUnread = selectedChatTicket.replies?.some(r => r.sender === 'admin' && !r.isRead);
        if (hasUnread) {
          socket.emit('mark_as_read', selectedChatTicket._id);
        }
      }
    }
  }, [selectedChatTicket, socket]);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white font-sans pb-24 md:pb-0">
      
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">

        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">Help & Support</h1>
          </div>

        </div>

        {/* Desktop Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center mb-2 -ml-3 md:ml-0"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="font-semibold text-[15px]">Back</span>
          </button>
        </motion.div>

        {/* Desktop Page Header */}
        <div className="hidden md:flex flex-col mb-4 px-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Help & Support</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Search our knowledge base or reach out to our team.</p>
        </div>

        {/* Hero Search Section */}
        <section className="bg-[var(--color-primary)] rounded-2xl md:rounded-3xl p-5 md:p-10 text-white shadow-xl shadow-[var(--color-primary)]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10">
            <LifeBuoy className="w-24 h-24 md:w-40 md:h-40 transform translate-x-1/4 -translate-y-1/4" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-lg md:text-3xl font-semibold mb-1 md:mb-3">How can we help?</h2>
            <p className="text-white/80 text-xs md:text-base font-medium mb-4 md:mb-8">Search our knowledge base for answers.</p>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl text-[14px] md:text-[15px] font-semibold text-white placeholder:text-white/60 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400 transition-all pl-11 shadow-sm"
              />
              <Search className={`w-4 h-4 md:w-5 md:h-5 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-gray-400' : 'text-white/80'}`} />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8 lg:gap-12 pt-2 md:pt-4">

          {/* Left Column: Contact Us */}
          <div className="lg:col-span-1 space-y-8">
            <section className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 border border-gray-100 shadow-sm">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-6">Contact Us</h3>
              {/* Mobile: horizontal grid of 3 | Desktop: vertical list */}
              <div className="grid grid-cols-3 gap-2 md:grid-cols-1 md:gap-0 md:divide-y md:divide-gray-100">
                <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 p-2 md:py-4 hover:bg-gray-50 rounded-xl md:rounded-2xl transition-all cursor-pointer group text-center md:text-left" onClick={() => setShowTicketModal(true)}>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                    <MessageSquareText className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-[11px] md:text-[14px] leading-tight">New Ticket</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 hidden md:block">We reply within 24h</p>
                  </div>
                </div>

                <a href="mailto:support@moncradle.com" className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 p-2 md:py-4 hover:bg-gray-50 rounded-xl md:rounded-2xl transition-all cursor-pointer group text-center md:text-left">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                    <Mail className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-[11px] md:text-[14px] leading-tight">Email Us</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 hidden md:block">support@moncradle.com</p>
                  </div>
                </a>

                <a href="tel:18001234567" className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 p-2 md:py-4 hover:bg-gray-50 rounded-xl md:rounded-2xl transition-all cursor-pointer group text-center md:text-left">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all shrink-0">
                    <Phone className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-[11px] md:text-[14px] leading-tight">Call Us</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 hidden md:block">1800-123-4567</p>
                  </div>
                </a>
              </div>
            </section>
          </div>

          {/* Right Column: Tickets & FAQs */}
          <div className="lg:col-span-2 space-y-8">

            {/* My Support Tickets */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-base md:text-xl font-semibold text-gray-900 whitespace-nowrap">My Support Tickets</h2>
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-[var(--color-primary)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-lg transition-colors shrink-0 ml-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Ticket
                </button>
              </div>
              {tickets.length === 0 ? (
                <div className="py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                  <p className="text-sm font-medium text-gray-500">You don't have any open support tickets.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map(ticket => (
                    <div key={ticket._id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-gray-200 transition-colors">
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="font-semibold text-gray-900 capitalize text-sm md:text-base">{ticket.issueType.replace(/_/g, ' ')}</h4>
                        <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ml-2 ${ticket.status === 'open' ? 'bg-orange-100 text-orange-600' : ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{ticket.status.replace('_',' ')}</span>
                      </div>
                      <p className="text-xs md:text-sm text-gray-500 font-medium mb-3 line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] md:text-xs text-gray-400 font-medium">{new Date(ticket.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <button onClick={() => setSelectedChatTicket(ticket)} className="text-xs md:text-sm font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors">View Chat</button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Load More Button */}
                  {tickets.length < totalTicketsCount && (
                    <div className="pt-3 flex justify-center">
                      <Button 
                        variant="outline" 
                        onClick={handleLoadMore} 
                        disabled={isLoadingMore}
                        className="w-full md:w-auto text-sm"
                      >
                        {isLoadingMore ? "Loading..." : `Load More (${totalTicketsCount - tickets.length} left)`}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[var(--color-primary)]/10 rounded-lg md:rounded-xl flex items-center justify-center text-[var(--color-primary)] shrink-0">
                  <FileText className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h2 className="text-base md:text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-xs md:text-sm text-gray-500 font-medium">No answers found for "{searchQuery}".<br />Please try a different keyword.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredFaqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div key={index} className={`transition-all duration-300 ${isOpen ? 'bg-[var(--color-primary)]/5 rounded-xl md:rounded-2xl' : 'hover:bg-gray-50 rounded-xl md:rounded-2xl'}`}>
                        <button onClick={() => toggleFaq(index)} className="w-full flex items-center justify-between p-3.5 md:p-5 text-left cursor-pointer focus:outline-none">
                          <span className={`font-semibold text-[13px] md:text-[15px] pr-3 md:pr-4 ${isOpen ? 'text-[var(--color-primary)]' : 'text-gray-800'}`}>
                            {faq.question}
                          </span>
                          <div className={`shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
                            {isOpen ? <ChevronUp className="w-3 h-3 md:w-4 md:h-4" /> : <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />}
                          </div>
                        </button>
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="px-3.5 md:px-5 pb-3.5 md:pb-5 text-[12px] md:text-sm text-gray-600 leading-relaxed font-medium">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      
      <AnimatePresence>
        {showTicketModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTicketModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Create Support Ticket</h3>
                <button onClick={() => setShowTicketModal(false)} className="p-1 text-gray-500 hover:text-gray-800"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Issue Type</label>
                  <select
                    value={ticketIssueType}
                    onChange={e => setTicketIssueType(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  >
                    <option value="delivery_issue">Delivery Issue</option>
                    <option value="payment_issue">Payment Issue</option>
                    <option value="food_quality">Food Quality</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    value={ticketDesc}
                    onChange={e => setTicketDesc(e.target.value)}
                    placeholder="Describe your issue..."
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm min-h-[120px] resize-none"
                  ></textarea>
                </div>
                <Button variant="primary" fullWidth onClick={handleCreateTicket} disabled={isSubmitting || ticketDesc.trim().length < 10}>
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Chat Modal */}
        {selectedChatTicket && (
          <div className="fixed inset-0 z-[200] flex flex-col md:items-center md:justify-center bg-gray-100 md:bg-black/40">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full h-full md:h-[80vh] md:max-w-2xl bg-white md:rounded-2xl shadow-xl flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 bg-[var(--color-primary)] text-white shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedChatTicket(null)} className="md:hidden"><ChevronLeft className="w-6 h-6" /></button>
                  <div>
                    <h3 className="font-semibold text-[16px] capitalize">{selectedChatTicket.issueType.replace('_', ' ')} Support</h3>
                    <p className="text-xs text-white/80">{selectedChatTicket.status === 'resolved' ? 'Ticket Closed' : 'We typically reply within 24h'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-3">
                  <a href={`tel:${process.env.NEXT_PUBLIC_SUPPORT_PHONE_NUMBER || '+919876543210'}`} title="Call Support" className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </a>
                  <button onClick={() => setSelectedChatTicket(null)} className="hidden md:block p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Original Query */}
              <details className="p-4 bg-yellow-50/50 border-b border-gray-100 shrink-0 group">
                <summary className="text-xs font-semibold text-yellow-800 cursor-pointer outline-none list-none flex items-center justify-between">
                  Your Issue Description
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm text-gray-700 break-words whitespace-pre-wrap">{selectedChatTicket.description}</p>
              </details>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5]" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}>
                {selectedChatTicket.replies?.length === 0 ? (
                  <div className="text-center py-6 bg-white/50 rounded-xl max-w-xs mx-auto shadow-sm">
                    <p className="text-sm font-medium text-gray-500">No replies yet. We will get back to you soon.</p>
                  </div>
                ) : (
                  selectedChatTicket.replies?.map((reply, idx) => {
                    const isMine = reply.sender === 'user';
                    const quotedMsg = reply.quotedReplyId ? getQuotedMessage(reply.quotedReplyId) : null;

                    return (
                      <div id={`msg-${reply._id}`} key={reply._id || idx} className={`flex flex-col group ${isMine ? 'items-end' : 'items-start'} px-2 relative`}>
                        <div 
                          onClick={() => !reply.isDeleted && setOpenDropdownId(openDropdownId === reply._id ? null : (reply._id ?? null))}
                          className={`relative max-w-[85%] rounded-lg shadow-sm px-3 pt-2 pb-1.5 text-[14.5px] cursor-pointer active:bg-black/5 transition-colors ${isMine ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none' : 'bg-white text-[#111b21] rounded-tl-none'}`}
                        >
                          
                          {/* Dropdown Chevron (WhatsApp style) */}
                          {!reply.isDeleted && (
                            <button 
                              className={`absolute top-1 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 bg-gradient-to-l ${isMine ? 'from-[#d9fdd3]' : 'from-white'} pl-2`}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          )}

                          {/* Dropdown Menu */}
                          {openDropdownId === reply._id && (
                            <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-6 right-2 bg-white shadow-lg rounded-md border border-gray-200 z-10 w-32 py-1 flex flex-col">
                              <button onClick={(e) => { e.stopPropagation(); startQuoting(reply); }} className="text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">Reply</button>
                              {isMine && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); startEditing(reply); }} className="text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">Edit</button>
                                  <button onClick={(e) => { e.stopPropagation(); reply._id && handleDeleteReply(reply._id); }} className="text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600">Delete</button>
                                </>
                              )}
                            </div>
                          )}

                          {/* Quoted Message */}
                          {quotedMsg && (
                            <div 
                              onClick={(e) => { e.stopPropagation(); reply.quotedReplyId && scrollToMessage(reply.quotedReplyId); }}
                              className="bg-black/5 border-l-4 border-[#00a884] rounded p-2 mb-1 cursor-pointer"
                            >
                              <div className="text-[11px] font-semibold text-[#00a884]">
                                {quotedMsg.sender === 'user' ? 'You' : 'Admin'}
                              </div>
                              <div className="text-[12px] text-gray-600 truncate max-w-full">
                                {quotedMsg.message}
                              </div>
                            </div>
                          )}

                          <div className={`pr-12 whitespace-pre-wrap leading-relaxed ${reply.isDeleted ? 'text-gray-400 italic' : ''}`}>
                            {reply.message}
                          </div>
                          <div className="text-[10.5px] text-gray-500 flex justify-end items-center mt-1 float-right ml-2 -mb-0.5 gap-1">
                            {reply.isEdited && !reply.isDeleted && <span>Edited</span>}
                            <span>{new Date(reply.createdAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMine && (
                              <div className="ml-1">
                                {!reply.isRead ? (
                                  <svg viewBox="0 0 16 15" width="16" height="15" className="text-gray-400 fill-current"><path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                                ) : (
                                  <svg viewBox="0 0 16 15" width="16" height="15" className="text-blue-500 fill-current"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              {selectedChatTicket.status !== 'resolved' ? (
                <div className="bg-[#f0f2f5] shrink-0 border-t border-gray-200 flex flex-col">
                  {/* Quote / Edit Indicator */}
                  {(quotingReplyId || editingReplyId) && (
                    <div className="bg-[#f0f2f5] px-4 py-2 flex items-center justify-between border-b border-gray-200">
                      <div className="flex-1 bg-black/5 border-l-4 border-[#00a884] rounded p-2">
                        <div className="text-[11px] font-semibold text-[#00a884]">
                          {editingReplyId ? 'Editing Message' : 'Replying to message'}
                        </div>
                        <div className="text-[12px] text-gray-600 truncate max-w-md">
                          {editingReplyId ? replyMessage : getQuotedMessage(quotingReplyId!)?.message}
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setQuotingReplyId(null);
                          setEditingReplyId(null);
                          setReplyMessage('');
                        }} 
                        className="p-2 text-gray-500 hover:text-gray-700 ml-2"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  <div className="p-3">
                    <form onSubmit={handleSendReply} className="flex items-end gap-2">
                    <textarea 
                      ref={textareaRef}
                      value={replyMessage}
                      onChange={e => {
                        setReplyMessage(e.target.value);
                        e.target.style.height = '48px';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply(e as any);
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 bg-white rounded-xl focus:outline-none resize-none min-h-[48px] text-[15px] shadow-sm custom-scrollbar"
                      style={{ height: '48px' }}
                    />
                    <button onMouseDown={e => e.preventDefault()} disabled={isReplying || !replyMessage.trim()} type="submit" className="w-12 h-12 flex-shrink-0 bg-[#00a884] rounded-full flex items-center justify-center text-white disabled:opacity-50 hover:bg-[#008f6f] shadow-sm">
                      <Send className="w-5 h-5 -ml-1 mt-0.5" />
                    </button>
                  </form>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 text-center text-gray-500 text-sm font-medium border-t border-gray-200">
                  This ticket has been marked as resolved and is closed.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
