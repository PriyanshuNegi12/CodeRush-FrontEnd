import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  ChevronDown,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Circle,
  ArrowUpDown,
  Tag,
  Building2,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

const ITEMS_PER_PAGE = 10;
const PILL_PREVIEW_COUNT = 8;

// Shared theme tokens — tweak these two and everything derived from them follows
const CARD_BG = 'bg-[#4F4F54]/70';
const HEADER_BG = 'bg-[#2A2A36]/40';

// Solid backgrounds for form controls (native <select> can't use alpha well)
const SELECT_BG = 'bg-[#3A3A44]';
const SELECT_BG_HOVER = 'hover:bg-[#44444F]';
const OPTION_STYLE = { backgroundColor: '#2A2A36', color: '#e2e8f0' };

const DIFFICULTY_STYLES = {
  easy: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
  medium: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
  hard: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
};

const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 };

function getPageRange(current, total) {
  const delta = 1;
  const range = [];
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }
  if (current - delta > 2) range.unshift('...');
  if (current + delta < total - 1) range.push('...');
  range.unshift(1);
  if (total > 1) range.push(total);
  return range;
}

function aggregateCounts(problems, field) {
  const counts = {};
  problems.forEach((p) => {
    const value = p[field];
    const items = Array.isArray(value) ? value : value ? [value] : [];
    items.forEach((item) => {
      counts[item] = (counts[item] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function HomePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [problems, setProblems] = useState([]);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedIds(new Set(data.problemSolved.map((p) => p._id)));
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, difficulty, sortBy, selectedTag, selectedCompany]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedIds(new Set());
  };

  const topics = useMemo(() => aggregateCounts(problems, 'tags'), [problems]);
  const companies = useMemo(() => aggregateCounts(problems, 'companies'), [problems]);
  const visibleTopics = showAllTopics ? topics : topics.slice(0, PILL_PREVIEW_COUNT);
  const visibleCompanies = showAllCompanies ? companies : companies.slice(0, PILL_PREVIEW_COUNT);

  const matchesField = (value, target) => {
    if (!target) return true;
    return Array.isArray(value) ? value.includes(target) : value === target;
  };

  const visibleProblems = useMemo(() => {
    const filtered = problems.filter((problem) => {
      const matchesDifficulty = difficulty === 'all' || problem.difficulty === difficulty;
      const matchesSearch = problem.title.toLowerCase().includes(search.trim().toLowerCase());
      const matchesTag = matchesField(problem.tags, selectedTag);
      const matchesCompany = matchesField(problem.companies, selectedCompany);
      return matchesDifficulty && matchesSearch && matchesTag && matchesCompany;
    });

    const sorted = [...filtered];
    if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'difficulty') {
      sorted.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
    } else {
      sorted.sort((a, b) => a.problemNumber - b.problemNumber);
    }
    return sorted;
  }, [problems, search, difficulty, sortBy, selectedTag, selectedCompany]);

  const totalPages = Math.max(1, Math.ceil(visibleProblems.length / ITEMS_PER_PAGE));

  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return visibleProblems.slice(start, start + ITEMS_PER_PAGE);
  }, [visibleProblems, currentPage]);

  const pageRange = useMemo(() => getPageRange(currentPage, totalPages), [currentPage, totalPages]);
  const initials = user?.firstname?.[0]?.toUpperCase() || '?';

  const pillClasses = (isActive) =>
    `group flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
        : 'border-white/10 bg-white/5 text-slate-300 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-300 hover:shadow-md'
    }`;

  return (
    <div className="relative min-h-screen w-full">
      {/* Fixed background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 900px 480px at 50% -5%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 65%),
            radial-gradient(ellipse 100% 85% at 50% 0%, #e7eaec 0%, #aab0b7 35%, #6b7178 65%, #3a3d42 100%)
          `,
          backgroundColor: "#7C9EA6",
        }}
      >
        <div className="absolute inset-0 flex">
          <div className="h-full w-[35%] bg-linear-to-r from-black/35 to-transparent" />
          <div className="flex-1" />
          <div className="h-full w-[35%] bg-linear-to-l from-black/35 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-linear-to-t from-black/45 to-transparent" />
        <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-slate-300/10 blur-3xl" />
        <div className="absolute -right-24 top-2/3 h-72 w-72 rounded-full bg-blue-200/10 blur-3xl" />
      </div>

      {/* Floating glass navbar — half width, distinct shade from page bg */}
      <div className="sticky top-4 z-20 px-4">
        <nav
          className={`mx-auto flex w-full max-w-xl items-center justify-between rounded-full border border-white/15 ${HEADER_BG} px-6 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl transition-colors duration-300 hover:bg-[#191924]/60`}
        >
          <NavLink
            to="/"
            className="text-lg font-bold tracking-tight text-white transition-colors duration-200 hover:text-slate-300"
          >
            CodeRush
          </NavLink>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="group flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors duration-200 hover:bg-white/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm font-semibold text-slate-900 ring-2 ring-transparent transition-all duration-300 group-hover:ring-white/40">
                {initials}
              </div>
              <span className="text-sm font-medium text-white/90">{user?.firstname}</span>
              <ChevronDown
                size={16}
                className="text-white/60 transition-transform duration-200 group-hover:translate-y-0.5"
              />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu z-30 mt-3 w-44 rounded-xl border border-white/10 bg-[#2a2c30] p-2 shadow-xl"
            >
              {user?.role === 'admin' && (
                <li>
                  <NavLink
                    to="/admin"
                    className="flex items-center gap-2 rounded-lg text-slate-200 transition-colors hover:bg-white/5"
                  >
                    <ShieldCheck size={16} /> Admin
                  </NavLink>
                </li>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg text-rose-400 transition-colors hover:bg-rose-500/10"
                >
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 pb-8 pt-6">
        {/* Popular Topics */}
        {topics.length > 0 && (
          <section className={`mb-6 rounded-2xl border border-white/10 ${CARD_BG} p-5 shadow-lg backdrop-blur-md`}>
            <div className="mb-3 flex items-center gap-2 text-slate-100">
              <Tag size={17} className="text-emerald-400" />
              <h2 className="font-semibold">Popular Topics</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {visibleTopics.map(({ name, count }) => {
                const isActive = selectedTag === name;
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedTag(isActive ? null : name)}
                    className={pillClasses(isActive)}
                  >
                    {name}
                    <span className={isActive ? 'text-emerald-100' : 'text-slate-500 group-hover:text-emerald-400'}>
                      ({count})
                    </span>
                  </button>
                );
              })}
              {topics.length > PILL_PREVIEW_COUNT && (
                <button
                  onClick={() => setShowAllTopics((v) => !v)}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-sm font-medium text-emerald-300 transition-colors duration-200 hover:bg-emerald-500/20"
                >
                  {showAllTopics ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </section>
        )}

        {/* Popular Companies */}
        {companies.length > 0 && (
          <section className={`mb-6 rounded-2xl border border-white/10 ${CARD_BG} p-5 shadow-lg backdrop-blur-md`}>
            <div className="mb-3 flex items-center gap-2 text-slate-100">
              <Building2 size={17} className="text-emerald-400" />
              <h2 className="font-semibold">Popular Companies</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {visibleCompanies.map(({ name, count }) => {
                const isActive = selectedCompany === name;
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedCompany(isActive ? null : name)}
                    className={pillClasses(isActive)}
                  >
                    {name}
                    <span className={isActive ? 'text-emerald-100' : 'text-slate-500 group-hover:text-emerald-400'}>
                      ({count})
                    </span>
                  </button>
                );
              })}
              {companies.length > PILL_PREVIEW_COUNT && (
                <button
                  onClick={() => setShowAllCompanies((v) => !v)}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-sm font-medium text-emerald-300 transition-colors duration-200 hover:bg-emerald-500/20"
                >
                  {showAllCompanies ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </section>
        )}

        {/* Filter bar */}
        <div className={`mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 ${CARD_BG} p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center`}>
          <div className="relative flex-1">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="input w-full rounded-xl border-none bg-white/5 pl-10 text-slate-100 placeholder:text-slate-400 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>

          {/* Difficulty select — solid background */}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={`select rounded-xl border-none ${SELECT_BG} ${SELECT_BG_HOVER} text-slate-100 shadow-inner shadow-black/20 transition-all focus:bg-[#44444F] focus:outline-none focus:ring-2 focus:ring-emerald-400/50`}
          >
            <option value="all" style={OPTION_STYLE}>All difficulties</option>
            <option value="easy" style={OPTION_STYLE}>Easy</option>
            <option value="medium" style={OPTION_STYLE}>Medium</option>
            <option value="hard" style={OPTION_STYLE}>Hard</option>
          </select>

          {/* Sort select — solid background */}
          <div className="relative">
            <ArrowUpDown size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`select rounded-xl border-none ${SELECT_BG} ${SELECT_BG_HOVER} pl-9 text-slate-100 shadow-inner shadow-black/20 transition-all focus:bg-[#44444F] focus:outline-none focus:ring-2 focus:ring-emerald-400/50`}
            >
              <option value="default" style={OPTION_STYLE}>Default</option>
              <option value="title" style={OPTION_STYLE}>Title A–Z</option>
              <option value="difficulty" style={OPTION_STYLE}>Difficulty</option>
            </select>
          </div>
        </div>

        {/* Active pill filters */}
        {(selectedTag || selectedCompany) && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-white/90">
            <span>Filtering by:</span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-emerald-100 backdrop-blur-md transition-colors hover:bg-emerald-500/25"
              >
                {selectedTag} ✕
              </button>
            )}
            {selectedCompany && (
              <button
                onClick={() => setSelectedCompany(null)}
                className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-emerald-100 backdrop-blur-md transition-colors hover:bg-emerald-500/25"
              >
                {selectedCompany} ✕
              </button>
            )}
          </div>
        )}

        {/* Problems table */}
        <div className={`overflow-hidden rounded-2xl border border-white/10 ${CARD_BG} shadow-xl backdrop-blur-md`}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-slate-300">
                <th className="w-14 px-5 py-3 font-medium">Status</th>
                <th className="w-14 px-2 py-3 font-medium">#</th>
                <th className="px-2 py-3 font-medium">Title</th>
                <th className="w-32 px-5 py-3 font-medium">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                    Loading problems...
                  </td>
                </tr>
              ) : paginatedProblems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                    No problems match your filters. Try adjusting search, difficulty, topic, or company.
                  </td>
                </tr>
              ) : (
                paginatedProblems.map((problem) => {
                  const isSolved = solvedIds.has(problem._id);
                  return (
                    <tr
                      key={problem._id}
                      className="border-b border-white/5 transition-colors duration-150 last:border-none hover:bg-white/5"
                    >
                      <td className="px-5 py-3.5">
                        {isSolved ? (
                          <CheckCircle2 size={19} className="text-emerald-400" />
                        ) : (
                          <Circle size={19} className="text-slate-500" />
                        )}
                      </td>
                      <td className="px-2 py-3.5 text-slate-400">{problem.problemNumber}</td>
                      <td className="px-2 py-3.5">
                        <NavLink
                          to={`/problem/${problem._id}`}
                          className="font-medium text-slate-100 transition-colors hover:text-emerald-400"
                        >
                          {problem.title}
                        </NavLink>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-transform duration-150 hover:scale-105 ${DIFFICULTY_STYLES[problem.difficulty]}`}
                        >
                          {problem.difficulty}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && visibleProblems.length > 0 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 text-white/90 sm:flex-row">
            <span className="text-sm">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, visibleProblems.length)} of {visibleProblems.length} problems
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Previous
              </button>

              {pageRange.map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-1.5 text-white/50">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-lg text-sm font-medium transition-all duration-150 ${
                      page === currentPage ? 'bg-white text-slate-900 shadow-md' : 'hover:bg-white/15'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ───────── Footer ───────── */}
        <footer className="mt-24 pt-12">
          {/* Top: two columns */}
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            {/* Left — Project */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                CodeRush
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300/90 sm:text-[15px]">
                Your gateway to a world of endless coding — from your first{' '}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-emerald-300">
                  console.log
                </code>{' '}
                to your first deployed app. CodeRush turns "I want to learn to code" into
                "I just built something," with guided lessons, real projects, and a
                roadmap from zero to job-ready.
              </p>
            </div>

            {/* Right — About Me */}
            <div>
              <h3 className="text-lg font-semibold text-slate-100">About Me</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-300/90 sm:text-[15px]">
                I'm Priyanshu Negi — a full stack developer and generative AI enthusiast
                from Uttarakhand. Currently in my final year of B.Tech CSE (2026), I
                build web apps and experiment with AI to make learning more interactive
                and accessible.
              </p>
            </div>
          </div>

          {/* Built With */}
          <div className="mt-14 border-t border-white/10 pt-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-slate-400">
              Built With
            </p>
            <p className="mt-3 text-sm text-slate-300/80">
              React <span className="mx-2 text-slate-500">·</span>
              Express <span className="mx-2 text-slate-500">·</span>
              MongoDB <span className="mx-2 text-slate-500">·</span>
              Tailwind + DaisyUI <span className="mx-2 text-slate-500">·</span>
              Lucide <span className="mx-2 text-slate-500">·</span>
              Gemini API <span className="mx-2 text-slate-500">·</span>
              Mongoose
            </p>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 pb-2 text-xs text-slate-400 sm:flex-row sm:items-center">
            <p>© 2026 Priyanshu Negi</p>
            <div className="flex items-center gap-5">
              <a
                href="https://github.com/PriyanshuNegi12"
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-200 hover:text-emerald-400"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/priyanshu-negi-829368277/"
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-200 hover:text-emerald-400"
              >
                LinkedIn
              </a>
              <a
                href="mailto:priyanshunegi.409@gmail.com"
                className="transition-colors duration-200 hover:text-emerald-400"
              >
                Email
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default HomePage;