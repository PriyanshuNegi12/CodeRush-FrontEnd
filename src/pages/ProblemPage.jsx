import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useParams } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import {
  Play,
  CloudUpload,
  Timer as TimerIcon,
  RotateCcw as ResetIcon,
  Pause,
  ChevronDown,
  LogOut,
  ShieldCheck,
  FileText,
  FlaskConical,
  BookOpen,
  History,
  MessagesSquare,
  Copy,
  Settings2,
  Maximize2,
  Minimize2,
  Loader2,
  CheckCircle2,
  XCircle,
  Tag,
  Building2,
  Code2,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import SubmissionHistory from '../components/SubmissionHistory';
import ChatAi from '../components/ChatAi';

const PAGE_BG = '#3a3d42';
const CARD_BG = 'bg-[#3a3d42]/70';
const HEADER_BG = 'bg-[#2a2c30]';
const CODE_BG = '#2a2c30';

const LANGUAGE_MAP = {
  cpp: { db: 'C++', monaco: 'cpp', label: 'C++' },
  java: { db: 'Java', monaco: 'java', label: 'Java' },
  javascript: { db: 'JavaScript', monaco: 'javascript', label: 'JavaScript' },
};

const DIFFICULTY_STYLES = {
  easy: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
  medium: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
  hard: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
};

const TOPIC_PILL =
  'rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-sm font-medium capitalize text-amber-300';
const COMPANY_PILL =
  'rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200';

const FONT_SIZES = [12, 14, 16, 18, 20];

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function fireConfetti() {
  const colors = [
    '#f43f5e', '#fb7185', '#f97316', '#fbbf24', '#eab308',
    '#a3e635', '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
    '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#ffffff',
  ];

  confetti({
    particleCount: 200,
    spread: 160,
    startVelocity: 75,
    origin: { x: 0.5, y: 0.5 },
    colors,
    scalar: 1.3,
    gravity: 1.1,
    ticks: 400,
    decay: 0.9,
  });

  confetti({
    particleCount: 90,
    angle: 60,
    spread: 90,
    startVelocity: 65,
    origin: { x: 0, y: 0.7 },
    colors,
    scalar: 1.15,
    ticks: 350,
  });
  confetti({
    particleCount: 90,
    angle: 120,
    spread: 90,
    startVelocity: 65,
    origin: { x: 1, y: 0.7 },
    colors,
    scalar: 1.15,
    ticks: 350,
  });

  [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].forEach((x) => {
    confetti({
      particleCount: 25,
      angle: 90,
      spread: 100,
      startVelocity: 50,
      origin: { x, y: 0 },
      colors,
      scalar: 1,
      gravity: 1.2,
      ticks: 320,
      drift: (Math.random() - 0.5) * 2,
    });
  });

  setTimeout(() => {
    confetti({
      particleCount: 120,
      spread: 140,
      startVelocity: 60,
      origin: { x: 0.5, y: 0.55 },
      colors,
      scalar: 1.1,
      gravity: 1.15,
      ticks: 340,
    });
  }, 180);

  setTimeout(() => {
    [0.15, 0.35, 0.65, 0.85].forEach((x) => {
      confetti({
        particleCount: 60,
        spread: 120,
        startVelocity: 55,
        origin: { x, y: 0.1 },
        colors,
        scalar: 0.95,
        ticks: 300,
      });
    });
  }, 350);
}

function defineCoderushTheme(monaco) {
  monaco.editor.defineTheme('coderush-transparent', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '7d858c', fontStyle: 'italic' },
      { token: 'comment.doc', foreground: '7d858c', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'e0baac' },
      { token: 'keyword.control', foreground: 'e0baac' },
      { token: 'string', foreground: 'a8b8b0' },
      { token: 'string.escape', foreground: 'c9d4cd' },
      { token: 'number', foreground: 'e7eaec' },
      { token: 'constant', foreground: 'e7eaec' },
      { token: 'type', foreground: 'aab0b7' },
      { token: 'type.identifier', foreground: 'aab0b7' },
      { token: 'class', foreground: 'aab0b7' },
      { token: 'identifier', foreground: 'd4d9dc' },
      { token: 'function', foreground: 'b8c2cc' },
      { token: 'operator', foreground: 'c4c8cb' },
      { token: 'delimiter', foreground: 'c4c8cb' },
      { token: 'delimiter.bracket', foreground: 'c4c8cb' },
      { token: 'variable', foreground: 'd4d9dc' },
      { token: 'variable.predefined', foreground: 'aab0b7' },
    ],
    colors: {
      'editor.background': '#00000000',
      'editorGutter.background': '#00000000',
      'editor.foreground': '#d4d9dc',
      'editorLineNumber.foreground': '#6f767d',
      'editorLineNumber.activeForeground': '#e0baac',
      'editor.lineHighlightBackground': '#ffffff0a',
      'editor.selectionBackground': '#5a636b80',
      'editor.inactiveSelectionBackground': '#4a525a60',
      'editorCursor.foreground': '#e0baac',
      'editorIndentGuide.background': '#ffffff12',
      'editorIndentGuide.activeBackground': '#ffffff28',
      'editorWhitespace.foreground': '#ffffff15',
      'editorBracketMatch.background': '#ffffff15',
      'editorBracketMatch.border': '#a8b8b0',
      'editorWidget.background': '#2a2f34',
      'editorWidget.border': '#3a4149',
      'editorSuggestWidget.background': '#2a2f34',
      'editorSuggestWidget.border': '#3a4149',
      'editorSuggestWidget.selectedBackground': '#3a434c',
      'scrollbarSlider.background': '#4a5560aa',
      'scrollbarSlider.hoverBackground': '#5e666ccc',
      'scrollbarSlider.activeBackground': '#6b7178',
    },
  });
}

function ProblemPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { problemId } = useParams();

  const [problem, setProblem] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [isSolved, setIsSolved] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const editorRef = useRef(null);

  const [activeLeftTab, setActiveLeftTab] = useState('description');

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultType, setResultType] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeTestCaseTab, setActiveTestCaseTab] = useState(0);

  const [fontSize, setFontSize] = useState(14);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [testCasePanelOpen, setTestCasePanelOpen] = useState(true);
  const [activeVisibleCase, setActiveVisibleCase] = useState(0);

  const [activeSolutionLang, setActiveSolutionLang] = useState(null);

  const [topicsOpen, setTopicsOpen] = useState(false);
  const [companiesOpen, setCompaniesOpen] = useState(false);
  const [openHints, setOpenHints] = useState(new Set());

  // ─── Mobile-only view switcher ('left' = Problem, 'right' = Code) ───
  const [mobileView, setMobileView] = useState('left');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const toggleHint = (index) => {
    setOpenHints((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const [toast, setToast] = useState('');
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 1600);
  }, []);

  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  const containerRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(50);
  const isDragging = useRef(false);

  useEffect(() => {
    const fetchProblem = async () => {
      setPageLoading(true);
      try {
        const { data } = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(data);
        const initialCode = data?.startCode?.find(
          (sc) => sc.language === LANGUAGE_MAP[selectedLanguage].db
        )?.initialCode;
        setCode(initialCode || '');
        if (data?.referenceSolution?.length) {
          setActiveSolutionLang(data.referenceSolution[0].language);
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setPageLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    const fetchSolvedStatus = async () => {
      if (!user) {
        setIsSolved(false);
        return;
      }
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        const solvedIds = new Set((data?.problemSolved || []).map((p) => p._id));
        setIsSolved(solvedIds.has(problemId));
      } catch (error) {
        console.error('Error fetching solved status:', error);
      }
    };
    fetchSolvedStatus();
  }, [problemId, user]);

  useEffect(() => {
    if (!problem) return;
    const initialCode = problem.startCode.find(
      (sc) => sc.language === LANGUAGE_MAP[selectedLanguage].db
    )?.initialCode;
    setCode(initialCode || '');
  }, [selectedLanguage, problem]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const handleDragStart = () => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
  };

  const handleDragMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let pct = ((e.clientX - rect.left) / rect.width) * 100;
    pct = Math.min(70, Math.max(30, pct));
    setLeftWidth(pct);
  }, []);

  const handleDragEnd = () => {
    isDragging.current = false;
    document.body.style.cursor = '';
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [handleDragMove]);

  const handleLogout = () => dispatch(logoutUser());

  const handleRun = async () => {
    setIsProcessing(true);
    setResultType('run');
    setActiveLeftTab('testresult');
    setMobileView('left'); // ← on mobile, jump back to Problem to show results
    try {
      const { data } = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: LANGUAGE_MAP[selectedLanguage].db,
      });
      setRunResult(data);
      setActiveTestCaseTab(0);
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({ success: false, testCases: [] });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsProcessing(true);
    setResultType('submit');
    setActiveLeftTab('testresult');
    setMobileView('left'); // ← on mobile, jump back to Problem to show verdict
    try {
      const { data } = await axiosClient.post(`/submission/submit/${problemId}`, {
        code,
        language: LANGUAGE_MAP[selectedLanguage].db,
      });
      setSubmitResult(data);
      if (data.accepted) {
        fireConfetti();
        setIsSolved(true);
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({ accepted: false, error: 'Internal server error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('Code copied!');
    } catch {
      showToast('Copy failed');
    }
  };

  const handleResetCode = () => {
    const initialCode = problem?.startCode.find(
      (sc) => sc.language === LANGUAGE_MAP[selectedLanguage].db
    )?.initialCode;
    setCode(initialCode || '');
    showToast('Code reset');
  };

  const handleCopySolution = async (text) => {
    try {
      await navigator.clipboard.writeText(text || '');
      showToast('Solution copied!');
    } catch {
      showToast('Copy failed');
    }
  };

  const initials = user?.firstname?.[0]?.toUpperCase() || '?';

  if (pageLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: PAGE_BG }}
      >
        <Loader2 className="animate-spin text-slate-400" size={28} />
      </div>
    );
  }

  const leftTabs = [
    { key: 'description', label: 'Description', icon: FileText },
    { key: 'testresult', label: 'Test Result', icon: FlaskConical },
    { key: 'solutions', label: 'Solutions', icon: BookOpen },
    { key: 'submissions', label: 'Submissions', icon: History },
    { key: 'chatai', label: 'ChatAI', icon: MessagesSquare },
  ];

  const solutions = problem?.referenceSolution || [];
  const currentSolution =
    solutions.find((s) => s.language === activeSolutionLang) || solutions[0];

  // ─── Panel width/visibility logic ───
  const leftPanelStyle = isMobile ? { width: '100%' } : { width: `${leftWidth}%` };

  const rightPanelStyle = isFullscreen
    ? { width: '100%', backgroundColor: PAGE_BG }
    : isMobile
    ? { width: '100%' }
    : { width: `${100 - leftWidth}%` };

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ backgroundColor: PAGE_BG }}
    >
      <style>{`
        .monaco-editor,
        .monaco-editor-background,
        .monaco-editor .margin,
        .monaco-editor .margin-view-overlays,
        .monaco-editor .monaco-editor-background {
          background-color: transparent !important;
          background-image: none !important;
        }
      `}</style>

      {/* Header */}
      <header
        className={`flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 sm:px-4 ${HEADER_BG}`}
      >
        <div className="flex items-center gap-4">
          <NavLink
            to="/"
            className="cursor-pointer text-lg font-bold tracking-tight text-white transition-colors duration-200 hover:text-slate-300"
          >
            CodeRush
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isProcessing}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-emerald-400/30 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3.5"
            title="Run"
          >
            <Play size={15} />
            <span className="hidden sm:inline">Run</span>
          </button>
          <button
            onClick={handleSubmitCode}
            disabled={isProcessing}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3.5"
            title="Submit"
          >
            <CloudUpload size={15} />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 sm:flex">
            <TimerIcon size={14} className="text-slate-400" />
            <span className="min-w-10.5 text-sm font-medium text-slate-200">
              {formatTime(seconds)}
            </span>
            <button
              onClick={() => setTimerRunning((r) => !r)}
              className="ml-1 cursor-pointer rounded-full p-1 text-slate-300 transition-colors duration-150 hover:bg-white/10 hover:text-white"
              title={timerRunning ? 'Pause' : 'Start'}
            >
              {timerRunning ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button
              onClick={() => {
                setTimerRunning(false);
                setSeconds(0);
              }}
              className="cursor-pointer rounded-full p-1 text-slate-300 transition-colors duration-150 hover:bg-white/10 hover:text-white"
              title="Reset"
            >
              <ResetIcon size={13} />
            </button>
          </div>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="group flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors duration-200 hover:bg-white/10"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs font-semibold text-slate-900 ring-2 ring-transparent transition-all duration-300 group-hover:ring-white/40">
                {initials}
              </div>
              <ChevronDown
                size={14}
                className="text-white/60 transition-transform duration-200 group-hover:translate-y-0.5"
              />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu z-50 mt-3 w-44 rounded-xl border border-white/10 p-2 shadow-2xl"
              style={{ backgroundColor: '#2a2c30' }}
            >
              {user?.role === 'admin' && (
                <li>
                  <NavLink
                    to="/admin"
                    className="flex cursor-pointer items-center gap-2 rounded-lg text-slate-200 transition-colors hover:bg-white/5"
                  >
                    <ShieldCheck size={16} /> Admin
                  </NavLink>
                </li>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2 rounded-lg text-rose-400 transition-colors hover:bg-rose-500/10"
                >
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* ─── Mobile-only: Problem / Code switcher ─── */}
      <div
        className={`flex shrink-0 border-b border-white/10 md:hidden ${HEADER_BG}`}
      >
        <button
          onClick={() => setMobileView('left')}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-b-2 py-2.5 text-sm font-medium transition-colors duration-150 ${
            mobileView === 'left'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400'
          }`}
        >
          <FileText size={15} /> Problem
        </button>
        <button
          onClick={() => setMobileView('right')}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-b-2 py-2.5 text-sm font-medium transition-colors duration-150 ${
            mobileView === 'right'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400'
          }`}
        >
          <Code2 size={15} /> Code
        </button>
      </div>

      {/* Body */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div
          style={leftPanelStyle}
          className={`${
            mobileView === 'left' ? 'flex' : 'hidden'
          } min-w-0 flex-col overflow-hidden md:flex`}
        >
          <div
            className={`flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 px-3 ${CARD_BG}`}
          >
            {leftTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveLeftTab(key)}
                className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  activeLeftTab === key
                    ? 'border-emerald-400 text-emerald-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* Tab content — chatai gets no padding + no scroll, everything else keeps it */}
          <div
            className={`flex-1 ${
              activeLeftTab === 'chatai' ? 'overflow-hidden p-3' : 'overflow-y-auto p-6'
            }`}
          >
            {problem && activeLeftTab === 'description' && (
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h1 className="text-2xl font-bold text-slate-100">{problem.title}</h1>
                  <div className="flex shrink-0 items-center gap-2">
                    {isSolved && (
                      <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
                        <CheckCircle2 size={12} /> Solved
                      </span>
                    )}
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${DIFFICULTY_STYLES[problem.difficulty]}`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                </div>

                <p className="mb-6 whitespace-pre-line leading-relaxed text-slate-300">
                  {problem.description}
                </p>

                <h3 className="mb-3 font-semibold text-slate-200">Examples</h3>
                <div className="space-y-4">
                  {problem.visibleTestCases.map((example, index) => (
                    <div
                      key={index}
                      className={`rounded-xl border border-white/10 p-4 ${CARD_BG}`}
                    >
                      <h4 className="mb-2 text-sm font-semibold text-slate-200">
                        Example {index + 1}
                      </h4>
                      <div className="space-y-1.5 font-mono text-sm text-slate-300">
                        <div>
                          <span className="text-slate-500">Input: </span>
                          {example.input}
                        </div>
                        <div>
                          <span className="text-slate-500">Output: </span>
                          {example.output}
                        </div>
                        <div className="font-sans text-slate-400">
                          <span className="font-mono text-slate-500">Explanation: </span>
                          {example.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints — extra top spacing to separate clearly from Examples */}
                {problem.constraints?.length > 0 && (
                  <div className="mt-10">
                    <h3 className="mb-3 font-semibold text-slate-200">Constraints</h3>
                    <ul className="list-disc space-y-1.5 pl-5 font-mono text-sm text-slate-300">
                      {problem.constraints.map((constraint, index) => (
                        <li key={index}>{constraint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Topics / Companies collapsible sections */}
                <div className="mt-8 rounded-xl border border-white/10">
                  <CollapsibleTagSection
                    icon={Tag}
                    label="Topics"
                    isOpen={topicsOpen}
                    onToggle={() => setTopicsOpen((v) => !v)}
                  >
                    {problem.tags?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {problem.tags.map((tag) => (
                          <span key={tag} className={TOPIC_PILL}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No topics tagged.</p>
                    )}
                  </CollapsibleTagSection>

                  <div className="border-t border-white/10" />

                  <CollapsibleTagSection
                    icon={Building2}
                    label="Companies"
                    isOpen={companiesOpen}
                    onToggle={() => setCompaniesOpen((v) => !v)}
                  >
                    {problem.companies?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {problem.companies.map((company) => (
                          <span key={company} className={COMPANY_PILL}>
                            {company}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No companies tagged.</p>
                    )}
                  </CollapsibleTagSection>
                </div>

                {/* Hints — rendered directly, no header / no wrapper */}
                {problem.hints?.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {problem.hints.map((hint, index) => {
                      const isHintOpen = openHints.has(index);
                      return (
                        <div
                          key={index}
                          className="overflow-hidden rounded-lg border border-white/10"
                        >
                          <button
                            onClick={() => toggleHint(index)}
                            className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
                          >
                            <span>Hint {index + 1}</span>
                            <ChevronDown
                              size={14}
                              className={`text-slate-400 transition-transform duration-200 ${
                                isHintOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {isHintOpen && (
                            <div className="border-t border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                              {hint}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeLeftTab === 'testresult' && (
              <TestResultPanel
                isProcessing={isProcessing}
                resultType={resultType}
                runResult={runResult}
                submitResult={submitResult}
                activeTestCaseTab={activeTestCaseTab}
                setActiveTestCaseTab={setActiveTestCaseTab}
                cardBg={CARD_BG}
              />
            )}

            {problem && activeLeftTab === 'solutions' && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-slate-100">Solutions</h2>
                {solutions.length ? (
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <div
                      className="flex items-center justify-between gap-2 border-b border-white/10 px-2 py-1.5"
                      style={{ backgroundColor: CODE_BG }}
                    >
                      <div className="flex flex-wrap gap-1">
                        {solutions.map((s) => {
                          const isActive = currentSolution?.language === s.language;
                          return (
                            <button
                              key={s.language}
                              onClick={() => setActiveSolutionLang(s.language)}
                              className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                                isActive
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-slate-300 hover:bg-white/10 hover:text-emerald-300'
                              }`}
                            >
                              {s.language}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handleCopySolution(currentSolution?.completeCode)}
                        className="flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors duration-150 hover:bg-white/10 hover:text-emerald-300"
                        title="Copy solution"
                      >
                        <Copy size={13} /> Copy
                      </button>
                    </div>

                    <pre
                      className="overflow-x-auto p-4 text-sm text-slate-100"
                      style={{ backgroundColor: CODE_BG }}
                    >
                      <code>{currentSolution?.completeCode}</code>
                    </pre>
                  </div>
                ) : (
                  <p className="text-slate-400">
                    Solutions will be available after you solve the problem.
                  </p>
                )}
              </div>
            )}

            {activeLeftTab === 'submissions' && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-slate-100">My Submissions</h2>
                <SubmissionHistory problemId={problemId} />
              </div>
            )}

            {activeLeftTab === 'chatai' && problem && (
              <div className="h-full">
                <ChatAi problem={problem} code={code} />
              </div>
            )}
          </div>
        </div>

        {/* Divider — desktop only */}
        <div
          onMouseDown={handleDragStart}
          className="hidden w-1 shrink-0 cursor-col-resize bg-white/5 transition-colors duration-150 hover:bg-emerald-500/40 md:block"
        />

        {/* Right panel */}
        <div
          style={rightPanelStyle}
          className={`${
            mobileView === 'right' ? 'flex' : 'hidden'
          } min-w-0 flex-col overflow-hidden md:flex ${
            isFullscreen ? 'fixed inset-0 z-50' : ''
          }`}
        >
          <div
            className={`flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2 ${
              isFullscreen ? HEADER_BG : CARD_BG
            }`}
          >
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="select select-sm w-28 cursor-pointer rounded-lg border-none bg-white/5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            >
              {Object.entries(LANGUAGE_MAP).map(([key, { label }]) => (
                <option key={key} value={key} className="bg-[#2a2c30] text-slate-100">
                  {label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                title="Copy code"
                className="cursor-pointer rounded-lg p-2 text-slate-300 transition-colors duration-150 hover:bg-white/10 hover:text-emerald-300"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={handleResetCode}
                title="Reset code"
                className="cursor-pointer rounded-lg p-2 text-slate-300 transition-colors duration-150 hover:bg-white/10 hover:text-emerald-300"
              >
                <ResetIcon size={16} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowFontMenu((v) => !v)}
                  title="Font size"
                  className="cursor-pointer rounded-lg p-2 text-slate-300 transition-colors duration-150 hover:bg-white/10 hover:text-emerald-300"
                >
                  <Settings2 size={16} />
                </button>
                {showFontMenu && (
                  <div
                    className="absolute right-0 top-full z-10 mt-2 w-28 rounded-xl border border-white/10 p-1.5 shadow-xl"
                    style={{ backgroundColor: '#2a2c30' }}
                  >
                    {FONT_SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setFontSize(size);
                          setShowFontMenu(false);
                        }}
                        className={`block w-full cursor-pointer rounded-lg px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
                          fontSize === size
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        {size}px
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsFullscreen((v) => !v)}
                title="Fullscreen"
                className="hidden cursor-pointer rounded-lg p-2 text-slate-300 transition-colors duration-150 hover:bg-white/10 hover:text-emerald-300 md:block"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1" style={{ backgroundColor: 'transparent' }}>
            <Editor
              height="100%"
              language={LANGUAGE_MAP[selectedLanguage].monaco}
              value={code}
              onChange={(value) => setCode(value || '')}
              beforeMount={defineCoderushTheme}
              onMount={(editor) => (editorRef.current = editor)}
              theme="coderush-transparent"
              options={{
                fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                renderLineHighlight: 'line',
                cursorStyle: 'line',
                mouseWheelZoom: true,
              }}
            />
          </div>

          <div
            className={`shrink-0 border-t border-white/10 ${
              isFullscreen ? HEADER_BG : CARD_BG
            }`}
            style={{ maxHeight: testCasePanelOpen ? '260px' : '40px' }}
          >
            <button
              onClick={() => setTestCasePanelOpen((v) => !v)}
              className="flex w-full cursor-pointer items-center justify-between px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <FlaskConical size={15} className="text-amber-400" /> Test Cases
              </span>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${
                  testCasePanelOpen ? '' : '-rotate-90'
                }`}
              />
            </button>

            {testCasePanelOpen && problem && (
              <div className="overflow-y-auto px-4 pb-4" style={{ maxHeight: '210px' }}>
                <div className="mb-3 flex gap-2">
                  {problem.visibleTestCases.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveVisibleCase(i)}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                        activeVisibleCase === i
                          ? 'bg-white text-slate-900'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Case {i + 1}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="mb-1 text-xs font-medium text-slate-400">Input</div>
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-slate-200">
                      {problem.visibleTestCases[activeVisibleCase]?.input}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-medium text-slate-400">
                      Expected Output
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-slate-200">
                      {problem.visibleTestCases[activeVisibleCase]?.output}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-100 -translate-x-1/2 rounded-lg border border-emerald-500/40 bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function CollapsibleTagSection({ icon: Icon, label, isOpen, onToggle, children }) {
  return (
    <div className="p-4">
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between text-slate-200"
      >
        <span className="flex items-center gap-2 font-semibold">
          <Icon size={17} className="text-slate-300" />
          {label}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
}

function TestResultPanel({
  isProcessing,
  resultType,
  runResult,
  submitResult,
  activeTestCaseTab,
  setActiveTestCaseTab,
  cardBg,
}) {
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
        <Loader2 size={28} className="animate-spin text-emerald-400" />
        <p>Running your code...</p>
      </div>
    );
  }

  if (!resultType) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center text-slate-400">
        <FlaskConical size={32} className="mb-1 text-slate-500" />
        <p className="font-medium text-slate-300">No Results Yet</p>
        <p className="text-sm">Run or submit your code to see results</p>
      </div>
    );
  }

  if (resultType === 'run' && runResult) {
    return (
      <div>
        <h3
          className={`mb-4 flex items-center gap-2 text-lg font-semibold ${
            runResult.success ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {runResult.success ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          {runResult.success ? 'All Visible Tests Passed' : 'Some Tests Failed'}
        </h3>

        <div className="mb-4 flex flex-wrap gap-2">
          {runResult.testCases?.map((tc, i) => {
            const passed = tc.status_id === 3;
            return (
              <button
                key={i}
                onClick={() => setActiveTestCaseTab(i)}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                  activeTestCaseTab === i
                    ? 'border-white/30 bg-white/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                } ${passed ? 'text-emerald-300' : 'text-rose-300'}`}
              >
                {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />} Case {i + 1}
              </button>
            );
          })}
        </div>

        {runResult.testCases?.[activeTestCaseTab] && (
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-xs font-medium text-slate-400">Input</div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-slate-200">
                {runResult.testCases[activeTestCaseTab].stdin}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-slate-400">Output</div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-slate-200">
                {runResult.testCases[activeTestCaseTab].stdout}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-slate-400">Expected</div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 font-mono text-sm text-emerald-300">
                {runResult.testCases[activeTestCaseTab].expected_output}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (resultType === 'submit' && submitResult) {
    return (
      <div>
        <h3
          className={`mb-1 flex items-center gap-2 text-xl font-bold ${
            submitResult.accepted ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {submitResult.accepted ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          {submitResult.accepted ? 'Accepted' : 'Wrong Answer'}
        </h3>
        <p className="mb-5 text-sm text-slate-400">
          {submitResult.passedTestCases}/{submitResult.totalTestCases} testcases passed
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-xl border border-white/10 p-4 ${cardBg}`}>
            <div className="mb-2 text-xs font-medium text-slate-400">Runtime</div>
            <div className="text-2xl font-bold text-slate-100">{submitResult.runtime}ms</div>
          </div>
          <div className={`rounded-xl border border-white/10 p-4 ${cardBg}`}>
            <div className="mb-2 text-xs font-medium text-slate-400">Memory</div>
            <div className="text-2xl font-bold text-slate-100">{submitResult.memory}KB</div>
          </div>
        </div>

        {submitResult.error && (
          <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300">
            {submitResult.error}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default ProblemPage;