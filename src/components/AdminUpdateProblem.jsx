import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Code2, FileText, ListChecks, EyeOff, ListOrdered, Lightbulb } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { useNavigate, useParams } from 'react-router';

const CARD_BG = 'bg-[#3a3d42]/70';

const TAG_OPTIONS = [
  { value: 'array', label: 'Array' },
  { value: 'string', label: 'String' },
  { value: 'linkedList', label: 'Linked List' },
  { value: 'graph', label: 'Graph' },
  { value: 'dp', label: 'DP' },
  { value: 'tree', label: 'Tree' },
  { value: 'binaryTree', label: 'Binary Tree' },
  { value: 'binarySearchTree', label: 'Binary Search Tree' },
  { value: 'stack', label: 'Stack' },
  { value: 'queue', label: 'Queue' },
  { value: 'heap', label: 'Heap' },
  { value: 'hashMap', label: 'Hash Map' },
  { value: 'hashing', label: 'Hashing' },
  { value: 'binarySearch', label: 'Binary Search' },
  { value: 'twoPointers', label: 'Two Pointers' },
  { value: 'slidingWindow', label: 'Sliding Window' },
  { value: 'recursion', label: 'Recursion' },
  { value: 'backtracking', label: 'Backtracking' },
  { value: 'greedy', label: 'Greedy' },
  { value: 'sorting', label: 'Sorting' },
  { value: 'searching', label: 'Searching' },
  { value: 'matrix', label: 'Matrix' },
  { value: 'trie', label: 'Trie' },
  { value: 'bitManipulation', label: 'Bit Manipulation' },
  { value: 'math', label: 'Math' },
  { value: 'numberTheory', label: 'Number Theory' },
  { value: 'unionFind', label: 'Union Find' },
  { value: 'segmentTree', label: 'Segment Tree' },
  { value: 'divideAndConquer', label: 'Divide And Conquer' },
  { value: 'simulation', label: 'Simulation' },
  { value: 'design', label: 'Design' },
  { value: 'topologicalSort', label: 'Topological Sort' },
  { value: 'shortestPath', label: 'Shortest Path' },
  { value: 'binaryIndexedTree', label: 'Binary Indexed Tree' },
];

const TAG_ENUM_VALUES = TAG_OPTIONS.map((t) => t.value);

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z
    .array(z.enum(TAG_ENUM_VALUES))
    .min(1, 'Select at least one tag'),
  companies: z.string().optional(),
  constraints: z
    .array(
      z.object({
        value: z.string().min(1, 'Constraint cannot be empty'),
      })
    )
    .min(1, 'At least one constraint required'),
  hints: z
    .array(
      z.object({
        value: z.string().min(1, 'Hint cannot be empty'),
      })
    )
    .optional(),
  visibleTestCases: z
    .array(
      z.object({
        input: z.string().min(1, 'Input is required'),
        output: z.string().min(1, 'Output is required'),
        explanation: z.string().min(1, 'Explanation is required'),
      })
    )
    .min(1, 'At least one visible test case required'),
  hiddenTestCases: z
    .array(
      z.object({
        input: z.string().min(1, 'Input is required'),
        output: z.string().min(1, 'Output is required'),
      })
    )
    .min(1, 'At least one hidden test case required'),
  startCode: z
    .array(
      z.object({
        language: z.enum(['C++', 'Java', 'JavaScript']),
        initialCode: z.string().min(1, 'Initial code is required'),
      })
    )
    .length(3, 'All three languages required'),
  referenceSolution: z
    .array(
      z.object({
        language: z.enum(['C++', 'Java', 'JavaScript']),
        completeCode: z.string().min(1, 'Complete code is required'),
      })
    )
    .length(3, 'All three languages required'),
});

const inputClass =
  'w-full rounded-xl border-none bg-white/5 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50';

const LANGUAGES = ['C++', 'Java', 'JavaScript'];

// Reorder server array into [C++, Java, JavaScript] so it matches the Zod schema
const orderByLanguage = (arr, codeKey) =>
  LANGUAGES.map(
    (lang) =>
      arr?.find((x) => x.language === lang) || { language: lang, [codeKey]: '' }
  );

// Normalize tags from the server into an array regardless of whether an
// old document still has the legacy single-string shape.
const normalizeTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string' && tags) return [tags];
  return [];
};

// Normalize a plain string array (constraints/hints) from the server into
// the [{ value: '...' }] shape useFieldArray needs. Falls back to a single
// empty row when nothing exists yet.
const normalizeToFieldArray = (arr, fallbackEmpty) => {
  if (Array.isArray(arr) && arr.length) return arr.map((v) => ({ value: v }));
  return fallbackEmpty ? [{ value: '' }] : [];
};

function FieldError({ message }) {
  if (!message) return null;
  return <span className="mt-1 block text-xs text-rose-400">{message}</span>;
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className={`rounded-2xl border border-white/10 ${CARD_BG} p-6 shadow-lg backdrop-blur-md`}>
      <div className="mb-5 flex items-center gap-2 text-slate-100">
        <Icon size={18} className="text-emerald-400" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function AdminUpdateProblem() {
  const navigate = useNavigate();
  const { problemId } = useParams();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      difficulty: 'easy',
      tags: [],
      companies: '',
      constraints: [{ value: '' }],
      hints: [],
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' },
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' },
      ],
    },
  });

  const {
    fields: constraintFields,
    append: appendConstraint,
    remove: removeConstraint,
  } = useFieldArray({ control, name: 'constraints' });

  const {
    fields: hintFields,
    append: appendHint,
    remove: removeHint,
  } = useFieldArray({ control, name: 'hints' });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
  } = useFieldArray({ control, name: 'visibleTestCases' });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({ control, name: 'hiddenTestCases' });

  // Fetch existing problem and prefill the form
  useEffect(() => {
    if (!problemId) return;

    const fetchProblem = async () => {
      try {
        setLoading(true);
        const { data: problem } = await axiosClient.get(
          `/problem/getProblemAndUpdateById/${problemId}`
        );

        reset({
          title: problem.title ?? '',
          description: problem.description ?? '',
          difficulty: problem.difficulty ?? 'easy',
          tags: normalizeTags(problem.tags),
          companies: Array.isArray(problem.companies)
            ? problem.companies.join(', ')
            : problem.companies ?? '',
          constraints: normalizeToFieldArray(problem.constraints, true),
          hints: normalizeToFieldArray(problem.hints, false),
          visibleTestCases:
            problem.visibleTestCases?.length
              ? problem.visibleTestCases
              : [{ input: '', output: '', explanation: '' }],
          hiddenTestCases:
            problem.hiddenTestCases?.length
              ? problem.hiddenTestCases
              : [{ input: '', output: '' }],
          startCode: orderByLanguage(problem.startCode, 'initialCode'),
          referenceSolution: orderByLanguage(problem.referenceSolution, 'completeCode'),
        });
      } catch (error) {
        setLoadError(
          error.response?.data?.message ||
            error.response?.data ||
            error.message ||
            'Failed to load problem'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        companies: data.companies
          ? data.companies.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
        constraints: data.constraints.map((c) => c.value).filter(Boolean),
        hints: (data.hints || []).map((h) => h.value).filter(Boolean),
      };
      await axiosClient.patch(`/problem/update/${problemId}`, payload);
      alert('Problem updated successfully!');
      navigate('/');
    } catch (error) {
      alert(
        `Error: ${
          error.response?.data?.message ||
          error.response?.data ||
          error.message
        }`
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#3a3d42]">
        <span className="text-slate-300">Loading problem...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#3a3d42] px-6">
        <div className="max-w-md rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <p className="mb-4 text-rose-300">{loadError}</p>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#3a3d42] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-white">Update Problem</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <SectionCard icon={FileText} title="Basic Information">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Title</label>
                <input
                  {...register('title')}
                  className={inputClass}
                  placeholder="e.g. Longest Substring Without Repeating Characters"
                />
                <FieldError message={errors.title?.message} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Description</label>
                <textarea
                  {...register('description')}
                  rows={5}
                  className={inputClass}
                  placeholder="Full problem statement..."
                />
                <FieldError message={errors.description?.message} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Difficulty</label>
                <select {...register('difficulty')} className={`${inputClass} sm:w-1/2`}>
                  <option value="easy" className="text-slate-900">Easy</option>
                  <option value="medium" className="text-slate-900">Medium</option>
                  <option value="hard" className="text-slate-900">Hard</option>
                </select>
                <FieldError message={errors.difficulty?.message} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Tags</label>
                <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                  {TAG_OPTIONS.map(({ value, label }) => (
                    <label key={value} className="cursor-pointer">
                      <input
                        type="checkbox"
                        value={value}
                        {...register('tags')}
                        className="peer sr-only"
                      />
                      <span className="inline-block rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium capitalize text-slate-300 transition-colors duration-150 peer-checked:border-emerald-500 peer-checked:bg-emerald-600 peer-checked:text-white">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
                <FieldError message={errors.tags?.message} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Companies</label>
                <input
                  {...register('companies')}
                  className={inputClass}
                  placeholder="Amazon, Google, Microsoft (comma-separated)"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Separate multiple companies with commas. Optional.
                </span>
              </div>

              {/* Constraints */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300">
                    <ListOrdered size={14} className="text-slate-400" /> Constraints
                  </label>
                  <button
                    type="button"
                    onClick={() => appendConstraint({ value: '' })}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-300 transition-colors duration-200 hover:bg-emerald-500/20"
                  >
                    <Plus size={15} /> Add Constraint
                  </button>
                </div>

                {errors.constraints?.root && <FieldError message={errors.constraints.root.message} />}
                {errors.constraints?.message && <FieldError message={errors.constraints.message} />}

                <div className="space-y-2">
                  {constraintFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                      <div className="flex-1">
                        <input
                          {...register(`constraints.${index}.value`)}
                          placeholder="e.g. 1 <= nums.length <= 10^4"
                          className={`${inputClass} font-mono text-sm`}
                        />
                        <FieldError message={errors.constraints?.[index]?.value?.message} />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeConstraint(index)}
                        disabled={constraintFields.length === 1}
                        className="mt-2.5 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-400 transition-colors duration-200 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hints */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300">
                    <Lightbulb size={14} className="text-slate-400" /> Hints
                  </label>
                  <button
                    type="button"
                    onClick={() => appendHint({ value: '' })}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-300 transition-colors duration-200 hover:bg-emerald-500/20"
                  >
                    <Plus size={15} /> Add Hint
                  </button>
                </div>
                <span className="mb-2 block text-xs text-slate-500">Optional. Shown to users progressively while solving.</span>

                <div className="space-y-2">
                  {hintFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                      <div className="flex-1">
                        <textarea
                          {...register(`hints.${index}.value`)}
                          placeholder={`Hint ${index + 1}`}
                          rows={2}
                          className={inputClass}
                        />
                        <FieldError message={errors.hints?.[index]?.value?.message} />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeHint(index)}
                        className="mt-2.5 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-400 transition-colors duration-200 hover:bg-rose-500/10"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {hintFields.length === 0 && (
                    <p className="text-sm text-slate-500">No hints added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Test Cases */}
          <SectionCard icon={ListChecks} title="Test Cases">
            {/* Visible Test Cases */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium text-slate-200">Visible Test Cases</h3>
                <button
                  type="button"
                  onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-300 transition-colors duration-200 hover:bg-emerald-500/20"
                >
                  <Plus size={15} /> Add Case
                </button>
              </div>

              {errors.visibleTestCases?.root && (
                <FieldError message={errors.visibleTestCases.root.message} />
              )}

              <div className="space-y-3">
                {visibleFields.map((field, index) => (
                  <div key={field.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">Case {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeVisible(index)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-400 transition-colors duration-200 hover:bg-rose-500/10"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        {...register(`visibleTestCases.${index}.input`)}
                        placeholder="Input"
                        className={inputClass}
                      />
                      <FieldError message={errors.visibleTestCases?.[index]?.input?.message} />

                      <input
                        {...register(`visibleTestCases.${index}.output`)}
                        placeholder="Output"
                        className={inputClass}
                      />
                      <FieldError message={errors.visibleTestCases?.[index]?.output?.message} />

                      <textarea
                        {...register(`visibleTestCases.${index}.explanation`)}
                        placeholder="Explanation"
                        rows={2}
                        className={inputClass}
                      />
                      <FieldError
                        message={errors.visibleTestCases?.[index]?.explanation?.message}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Test Cases */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 font-medium text-slate-200">
                  <EyeOff size={15} className="text-slate-400" /> Hidden Test Cases
                </h3>
                <button
                  type="button"
                  onClick={() => appendHidden({ input: '', output: '' })}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-300 transition-colors duration-200 hover:bg-emerald-500/20"
                >
                  <Plus size={15} /> Add Case
                </button>
              </div>

              {errors.hiddenTestCases?.root && (
                <FieldError message={errors.hiddenTestCases.root.message} />
              )}

              <div className="space-y-3">
                {hiddenFields.map((field, index) => (
                  <div key={field.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">Case {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeHidden(index)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-400 transition-colors duration-200 hover:bg-rose-500/10"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        {...register(`hiddenTestCases.${index}.input`)}
                        placeholder="Input"
                        className={inputClass}
                      />
                      <FieldError message={errors.hiddenTestCases?.[index]?.input?.message} />

                      <input
                        {...register(`hiddenTestCases.${index}.output`)}
                        placeholder="Output"
                        className={inputClass}
                      />
                      <FieldError message={errors.hiddenTestCases?.[index]?.output?.message} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Code Templates */}
          <SectionCard icon={Code2} title="Code Templates">
            <div className="space-y-6">
              {[0, 1, 2].map((index) => {
                const language = index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript';
                return (
                  <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <h3 className="mb-3 font-medium text-emerald-300">{language}</h3>

                    {/* Hidden inputs so `language` is included on submit */}
                    <input type="hidden" {...register(`startCode.${index}.language`)} />
                    <input type="hidden" {...register(`referenceSolution.${index}.language`)} />

                    <div className="mb-4">
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">
                        Initial Code
                      </label>
                      <textarea
                        {...register(`startCode.${index}.initialCode`)}
                        rows={6}
                        className={`${inputClass} font-mono text-sm`}
                        placeholder={`// Starter code shown to the user in ${language}`}
                      />
                      <FieldError message={errors.startCode?.[index]?.initialCode?.message} />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">
                        Reference Solution
                      </label>
                      <textarea
                        {...register(`referenceSolution.${index}.completeCode`)}
                        rows={6}
                        className={`${inputClass} font-mono text-sm`}
                        placeholder={`// Full working solution in ${language}, used to validate test cases`}
                      />
                      <FieldError
                        message={errors.referenceSolution?.[index]?.completeCode?.message}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-base font-medium text-white transition-colors duration-200 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Updating Problem...' : 'Update Problem'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminUpdateProblem;