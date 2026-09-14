import { useState, useEffect, useRef } from 'react';
import axiosClient from '../utils/axiosClient';
import {
  Sparkles,
  Send,
  User,
  Lightbulb,
  Code2,
  Zap,
  Bug,
  Workflow,
  ShieldAlert,
  Loader2,
  Copy,
  Check,
  Cpu,
} from 'lucide-react';

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Render **bold** markers inside a line
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// Lightweight markdown-ish renderer: bullet lines + bold
function MessageBody({ text }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span>{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }
        if (!trimmed) return <div key={i} className="h-1" />;
        return <div key={i}>{renderInline(line)}</div>;
      })}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isAI = msg.sender === 'ai';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <div
      className={`flex gap-2.5 animate-[cg-msg-in_0.35s_ease-out] ${
        isAI ? '' : 'flex-row-reverse'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {isAI && (
          <div className="absolute inset-0 rounded-full bg-linear-to-br from-emerald-400 to-sky-400 opacity-50 blur-md animate-[cg-pulse_3s_ease-in-out_infinite]" />
        )}
        <div
          className={`relative flex h-7 w-7 items-center justify-center rounded-full ${
            isAI
              ? 'bg-linear-to-br from-emerald-500 to-sky-500'
              : 'border border-white/10 bg-white/10'
          }`}
        >
          {isAI ? (
            <Sparkles size={13} className="text-white" />
          ) : (
            <User size={13} className="text-slate-300" />
          )}
        </div>
      </div>

      {/* Bubble + time */}
      <div className={`flex min-w-0 max-w-[86%] flex-col ${isAI ? '' : 'items-end'}`}>
        <div
          className={`group relative rounded-2xl px-3.5 py-2.5 ${
            isAI
              ? 'border border-white/10 bg-white/5 text-slate-200'
              : 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
          }`}
        >
          {isAI ? (
            <MessageBody text={msg.text} />
          ) : (
            <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
          )}

          {isAI && (
            <button
              onClick={handleCopy}
              title="Copy message"
              className="absolute -right-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#2a2c30] text-slate-400 opacity-0 transition-opacity duration-150 hover:text-emerald-300 group-hover:opacity-100"
            >
              {copied ? (
                <Check size={11} className="text-emerald-400" />
              ) : (
                <Copy size={11} />
              )}
            </button>
          )}
        </div>
        <span className="mt-1 px-1 text-[10px] text-slate-500">{msg.time}</span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 animate-[cg-msg-in_0.35s_ease-out]">
      <div className="relative shrink-0">
        <div className="absolute inset-0 rounded-full bg-linear-to-br from-emerald-400 to-sky-400 opacity-50 blur-md animate-[cg-pulse_3s_ease-in-out_infinite]" />
        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-sky-500">
          <Sparkles size={13} className="text-white" />
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-[cg-typing_1.2s_ease-in-out_infinite]" />
        <span
          className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-[cg-typing_1.2s_ease-in-out_infinite]"
          style={{ animationDelay: '0.15s' }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-[cg-typing_1.2s_ease-in-out_infinite]"
          style={{ animationDelay: '0.3s' }}
        />
        <span className="ml-1 text-xs text-slate-400">AI is thinking…</span>
      </div>
    </div>
  );
}

export default function ChatAi({ problem, code = '' }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!problem?.title) return;
    const welcome = [
      '👋 Welcome to AI Assistant!',
      '',
      `I'm here to help you with "${problem.title}".`,
      '',
      "Here's what I can assist you with:",
      '• **Hints** — Step-by-step guidance to solve the problem',
      '• **Algorithm Explanations** — Detailed breakdown of approaches',
      '• **Code Examples** — Sample implementations in different languages',
      '• **Optimization Tips** — How to improve your solution\'s performance',
      '• **Edge Cases** — Important test scenarios to consider',
      '',
      'Feel free to ask me anything! You can also click the quick action buttons below to get started. 🚀',
    ].join('\n');

    setMessages([{ id: 'welcome', sender: 'ai', text: welcome, time: nowTime() }]);
  }, [problem?.title]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isThinking]);

  const pushMessage = (msg) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        time: nowTime(),
        ...msg,
      },
    ]);
  };

  const sendToAI = async (userText) => {
    const trimmed = userText.trim();
    if (!trimmed || isThinking) return;

    pushMessage({ sender: 'user', text: trimmed });
    setInput('');
    setIsThinking(true);

    try {
      const { data } = await axiosClient.post('/ai/chat', {
  title: problem?.title,
  description: problem?.description,
  testCases: problem?.visibleTestCases,
  startCode: problem?.startCode,
  messages: [
    ...messages.map((m) => ({
      role: m.sender === 'ai' ? 'model' : 'user',
      content: [{ type: 'text', text: m.text }],
    })),
    { role: 'user', content: [{ type: 'text', text: trimmed }] },
  ],
});

      const reply =
        data?.reply ||
        data?.message ||
        data?.response ||
        'Sorry, I could not generate a response.';

      pushMessage({ sender: 'ai', text: reply });
    } catch (err) {
      console.error('Chat AI error:', err);
      pushMessage({
        sender: 'ai',
        text: '⚠️ Could not reach AI right now. Please try again in a moment.',
      });
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendToAI(input);
  };

  const quickActions = [
    {
      label: 'Hints',
      icon: Lightbulb,
      onClick: () =>
        sendToAI(
          'Give me a hint to solve this problem without revealing the full solution.'
        ),
    },
    {
      label: 'Algorithm',
      icon: Workflow,
      onClick: () =>
        sendToAI('Explain the algorithm and approaches for solving this problem.'),
    },
    {
      label: 'Code Examples',
      icon: Code2,
      onClick: () =>
        sendToAI('Show me a sample code implementation for this problem.'),
    },
    {
      label: 'Optimize',
      icon: Zap,
      onClick: () =>
        sendToAI('How can I optimize my solution for better performance?'),
    },
    {
      label: 'Edge Cases',
      icon: ShieldAlert,
      onClick: () =>
        sendToAI('What edge cases and corner scenarios should I handle for this problem?'),
    },
    {
      label: 'Check my code',
      icon: Bug,
      onClick: () => {
        if (!code?.trim()) {
          pushMessage({
            sender: 'ai',
            text: '✍️ Write something in your code editor first, then I can help you find issues and suggest fixes.',
          });
          return;
        }
        sendToAI('Review my current code, find issues, and suggest fixes.');
      },
    },
  ];

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10">
      {/* Keyframes */}
      <style>{`
        @keyframes cg-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.08); }
        }
        @keyframes cg-typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes cg-msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cg-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes cg-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes cg-scan {
          0% { transform: translateY(-100%); opacity: 0; }
          40% { opacity: 0.8; }
          100% { transform: translateY(500%); opacity: 0; }
        }
      `}</style>

      {/* Futuristic background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(168,184,176,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(168,184,176,0.6) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          }}
        />
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl animate-[cg-float_6s_ease-in-out_infinite]" />
        <div
          className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl animate-[cg-float_7s_ease-in-out_infinite]"
          style={{ animationDelay: '1s' }}
        />
        <div className="absolute inset-x-0 top-0 h-8 bg-linear-to-b from-emerald-400/20 to-transparent animate-[cg-scan_6s_ease-in-out_infinite]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 border-b border-white/10 bg-[#2a2c30]/60 px-4 py-3 backdrop-blur-sm">
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-linear-to-br from-emerald-400 to-sky-400 opacity-60 blur-md animate-[cg-pulse_3s_ease-in-out_infinite]" />
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-sky-500">
            <Sparkles size={16} className="text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-slate-100">
              AI Assistant
            </h2>
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-[cg-pulse_1.5s_ease-in-out_infinite]" />
              ONLINE
            </span>
          </div>
          <p className="truncate text-[11px] text-slate-500">Powered by CodeRush</p>
        </div>

        <Cpu
          size={16}
          className="shrink-0 text-slate-500 animate-[cg-orbit_8s_linear_infinite]"
        />
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isThinking && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="relative z-10 border-t border-white/10 bg-[#2a2c30]/40 px-3 py-2 backdrop-blur-sm">
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              disabled={isThinking}
              className="group flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-all duration-150 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-300 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex items-center gap-2 border-t border-white/10 bg-[#2a2c30]/70 p-3 backdrop-blur-sm"
      >
        <div className="group relative flex-1">
          <div className="pointer-events-none absolute -inset-px rounded-xl bg-linear-to-r from-emerald-500/40 to-sky-500/40 opacity-0 blur-[1px] transition-opacity duration-200 group-focus-within:opacity-100" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI anything…"
            disabled={isThinking}
            className="relative w-full rounded-xl border border-white/10 bg-[#1f2226] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 focus:border-emerald-400/40 focus:outline-none focus:ring-0 disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={isThinking || !input.trim()}
          className="group relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 text-white transition-all duration-200 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-[0_0_16px_rgba(16,185,129,0.4)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          aria-label="Send"
        >
          {isThinking ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
        </button>
      </form>
    </div>
  );
}