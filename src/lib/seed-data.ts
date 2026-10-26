export interface SeedTask {
  title: string;
  category: "LeetCode" | "CS50" | "Security" | "Projects" | "ML/AI" | "Routine";
  priority: "high" | "medium" | "low";
  is_recurring: boolean;
  recurrence_rule?: string; // 'daily', 'weekday', 'weekend', 'sunday', etc.
  default_duration_minutes: number;
  notes?: string;
  scheduled_date?: string; // If non-recurring milestone
}

export const PHASE_1_MILESTONES: SeedTask[] = [
  // Oct 26, 2026 (Mon)
  {
    title: "LeetCode: Topic 1 (Arrays & Hashing - 2 Mediums)",
    category: "LeetCode",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 45,
    notes: "Top K Frequent Elements, Group Anagrams. Focus on optimal O(N) space/time.",
    scheduled_date: "2026-10-26"
  },
  {
    title: "CS50: Lecture 0 Computational Thinking & Scratch",
    category: "CS50",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Review core problem solving foundations, algorithms, precision.",
    scheduled_date: "2026-10-26"
  },
  {
    title: "Pwn.college: Module 1 Intro to Computer Systems",
    category: "Security",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Linux memory layout, register architecture, gdb basics.",
    scheduled_date: "2026-10-26"
  },
  {
    title: "Cold-mail-bot: Project Setup & SMTP/Resend API",
    category: "Projects",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 90,
    notes: "Configure environment variables, email template engine, and rate limiting envelope.",
    scheduled_date: "2026-10-26"
  },
  {
    title: "PyTorch Fundamentals: Tensors, Shapes & Broadcasting",
    category: "ML/AI",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Matrix multiplications, einsum, device placement (CUDA/MPS/CPU).",
    scheduled_date: "2026-10-26"
  },
  {
    title: "⚡ CRUNCH: Customer Churn Model - Dataset EDA & Missing Values",
    category: "ML/AI",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 120,
    notes: "Target deadline Nov 2. Clean anomalies, distributions, correlation matrix.",
    scheduled_date: "2026-10-26"
  },

  // Oct 27, 2026 (Tue)
  {
    title: "LeetCode: Topic 2 (Two Pointers & Sliding Window - 2 Problems)",
    category: "LeetCode",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 45,
    notes: "Container With Most Water, Longest Substring Without Repeating Characters.",
    scheduled_date: "2026-10-27"
  },
  {
    title: "CS50: Lecture 1 C Basics & Problem Set 0 Submission",
    category: "CS50",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Compiling with clang, variables, conditions, loops.",
    scheduled_date: "2026-10-27"
  },
  {
    title: "Pwn.college: Linux CLI Shells & Permissions",
    category: "Security",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "SUID bits, environment variables, PATH hijacking fundamentals.",
    scheduled_date: "2026-10-27"
  },
  {
    title: "Cold-mail-bot: Lead CSV Ingestion & Validation Pipeline",
    category: "Projects",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 90,
    notes: "Deduplication, MX-record verification, schema mapping.",
    scheduled_date: "2026-10-27"
  },
  {
    title: "PyTorch: Autograd & Computation Graph",
    category: "ML/AI",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Gradient backward pass, retain_graph, custom autograd functions.",
    scheduled_date: "2026-10-27"
  },
  {
    title: "⚡ CRUNCH: Customer Churn Model - Feature Engineering Pipeline",
    category: "ML/AI",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 120,
    notes: "Categorical encoding (Target/One-Hot), numerical scaling, tenure binning.",
    scheduled_date: "2026-10-27"
  },

  // Oct 28, 2026 (Wed)
  {
    title: "LeetCode: Topic 3 (Stack & Binary Search - 2 Problems)",
    category: "LeetCode",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 45,
    notes: "Daily Temperatures, Search in Rotated Sorted Array.",
    scheduled_date: "2026-10-28"
  },
  {
    title: "CS50: Problem Set 1 (Mario, Cash/Credit in C)",
    category: "CS50",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Implement Luhn's algorithm, nested loops, precision checks.",
    scheduled_date: "2026-10-28"
  },
  {
    title: "Pwn.college: Shellcoding Module - Assembly Fundamentals",
    category: "Security",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "x86_64 syscall conventions, avoiding null bytes in shellcode.",
    scheduled_date: "2026-10-28"
  },
  {
    title: "Cold-mail-bot: Dynamic Email Personalization Template Engine",
    category: "Projects",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 90,
    notes: "Liquid/Mustache tags, spam trigger word detection score.",
    scheduled_date: "2026-10-28"
  },
  {
    title: "NLM + PyTorch: Neural Language Modeling N-gram Baseline",
    category: "ML/AI",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Build Bengio 2003 MLP language model in PyTorch from scratch.",
    scheduled_date: "2026-10-28"
  },
  {
    title: "⚡ CRUNCH: Customer Churn Model - Baseline Models (Logistic & RF)",
    category: "ML/AI",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 120,
    notes: "Stratified k-fold cross validation, baseline metrics calculation.",
    scheduled_date: "2026-10-28"
  },

  // Oct 29, 2026 (Thu)
  {
    title: "LeetCode: Topic 4 (Linked List - 2 Problems)",
    category: "LeetCode",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 45,
    notes: "Reorder List, Merge k Sorted Lists.",
    scheduled_date: "2026-10-29"
  },
  {
    title: "CS50: Lecture 2 Arrays, Strings & Memory Inspection",
    category: "CS50",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "ASCII, strings as char arrays, command-line arguments.",
    scheduled_date: "2026-10-29"
  },
  {
    title: "Pwn.college: Reverse Engineering & Disassembly",
    category: "Security",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Ghidra / objdump workflow, branching logic analysis.",
    scheduled_date: "2026-10-29"
  },
  {
    title: "Cold-mail-bot: Queue Worker & Rate Limiting Engine",
    category: "Projects",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 90,
    notes: "Staggered dispatch interval, jitter, bounce handling webhook.",
    scheduled_date: "2026-10-29"
  },
  {
    title: "NLM + PyTorch: Word2Vec & Embedding Layers",
    category: "ML/AI",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Skip-gram with negative sampling in PyTorch.",
    scheduled_date: "2026-10-29"
  },
  {
    title: "⚡ CRUNCH: Customer Churn Model - Gradient Boosting (XGBoost/LightGBM)",
    category: "ML/AI",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 120,
    notes: "Hyperparameter search with Optuna, class imbalance weights (scale_pos_weight).",
    scheduled_date: "2026-10-29"
  },

  // Oct 30, 2026 (Fri)
  {
    title: "LeetCode: Topic 5 (Trees - 2 Problems)",
    category: "LeetCode",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 45,
    notes: "Lowest Common Ancestor, Binary Tree Maximum Path Sum.",
    scheduled_date: "2026-10-30"
  },
  {
    title: "CS50: Problem Set 2 (Readability & Caesar/Substitution)",
    category: "CS50",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Coleman-Liau index, cryptographic substitution cipher.",
    scheduled_date: "2026-10-30"
  },
  {
    title: "Pwn.college: Format String Exploitation",
    category: "Security",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Reading stack pointers (%p), arbitrary write (%n).",
    scheduled_date: "2026-10-30"
  },
  {
    title: "Cold-mail-bot: Automated Dispatch & Error Logging",
    category: "Projects",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 90,
    notes: "Winston logging, dead-letter queue, retry strategy.",
    scheduled_date: "2026-10-30"
  },
  {
    title: "NLM + PyTorch: Recurrent Neural Networks (LSTM/GRU)",
    category: "ML/AI",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Sequence classification, hidden state propagation, packed sequences.",
    scheduled_date: "2026-10-30"
  },
  {
    title: "⚡ CRUNCH: Customer Churn Model - Evaluation & Metric Threshold Tuning",
    category: "ML/AI",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 120,
    notes: "PR-AUC vs ROC-AUC, threshold optimization for business cost of false negatives.",
    scheduled_date: "2026-10-30"
  },

  // Oct 31, 2026 (Sat)
  {
    title: "LeetCode: Topic 6 (Heap / Priority Queue & Backtracking - 2 Problems)",
    category: "LeetCode",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Kth Largest Element in an Array, Combination Sum.",
    scheduled_date: "2026-10-31"
  },
  {
    title: "CS50: Lecture 3 Algorithms, Linear/Binary Search, Bubble/Merge Sort",
    category: "CS50",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Big O, Omega, Theta notations and recursion.",
    scheduled_date: "2026-10-31"
  },
  {
    title: "Pwn.college: Return-Oriented Programming (ROP) Primer",
    category: "Security",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "ROPgadget identification, constructing ret2win payloads.",
    scheduled_date: "2026-10-31"
  },
  {
    title: "Cold-mail-bot: Full Integration Test Run with Test Inbox",
    category: "Projects",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 90,
    notes: "Send 25 test emails, verify tracking pixels and unsubscribe header links.",
    scheduled_date: "2026-10-31"
  },
  {
    title: "NLM + PyTorch: Self-Attention & Transformer Layer from Scratch",
    category: "ML/AI",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 90,
    notes: "Scaled dot-product attention, multi-head attention module.",
    scheduled_date: "2026-10-31"
  },
  {
    title: "⚡ CRUNCH: Customer Churn Model - Explainability (SHAP & Feature Importance)",
    category: "ML/AI",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 120,
    notes: "Generate TreeExplainer plots, export top retention factors.",
    scheduled_date: "2026-10-31"
  },

  // Nov 1, 2026 (Sun)
  {
    title: "LeetCode: Topic 7 (Graphs - 2 Problems)",
    category: "LeetCode",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Number of Islands, Course Schedule (Topological Sort).",
    scheduled_date: "2026-11-01"
  },
  {
    title: "CS50: Problem Set 3 (Runoff / Tideman Ranked Choice Voting)",
    category: "CS50",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 90,
    notes: "Cycle detection algorithm in C directed graphs.",
    scheduled_date: "2026-11-01"
  },
  {
    title: "Pwn.college: Challenge Lab Completion & Writeup",
    category: "Security",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Synthesize lessons learned, capture final flags.",
    scheduled_date: "2026-11-01"
  },
  {
    title: "Cold-mail-bot: Production Deployment & Docker Container",
    category: "Projects",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Dockerfile, secrets injection, health check endpoints.",
    scheduled_date: "2026-11-01"
  },
  {
    title: "⚡ CRUNCH: Customer Churn Model - Inference Service (FastAPI & Docker)",
    category: "ML/AI",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 150,
    notes: "FastAPI predict endpoint, Pydantic input validation, latency benchmark.",
    scheduled_date: "2026-11-01"
  },
  {
    title: "Sunday Weekly Catch-up & Backlog Clearance",
    category: "Routine",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Review any rolled-over items from Oct 26-31. Clear the deck for deadline day.",
    scheduled_date: "2026-11-01"
  },

  // Nov 2, 2026 (Mon - HARD DEADLINE)
  {
    title: "🚨 DEADLINE: Customer Churn Model - Final Validation, Streamlit UI & SHIP",
    category: "ML/AI",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 180,
    notes: "FINAL DEADLINE TODAY. Complete Streamlit dashboard, deploy to production, record demo.",
    scheduled_date: "2026-11-02"
  },
  {
    title: "LeetCode: Topic 8 (Dynamic Programming 1D - 2 Problems)",
    category: "LeetCode",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 45,
    notes: "House Robber, Coin Change. Memoization & Tabulation.",
    scheduled_date: "2026-11-02"
  },
  {
    title: "CS50: Week 4 Memory & Pointers Lecture",
    category: "CS50",
    priority: "high",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Hexadecimal, pointers, malloc, valgrind for memory leaks.",
    scheduled_date: "2026-11-02"
  },
  {
    title: "Cold-mail-bot: Launch First Live Outbound Campaign",
    category: "Projects",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Monitor deliverability, SPF/DKIM verification, reply inbox.",
    scheduled_date: "2026-11-02"
  },
  {
    title: "NLM + PyTorch: Miniature Character-Level Transformer Training",
    category: "ML/AI",
    priority: "medium",
    is_recurring: false,
    default_duration_minutes: 60,
    notes: "Train miniature Shakespeare char-RNN / transformer, inspect text generation.",
    scheduled_date: "2026-11-02"
  }
];

export const PHASE_2_STEADY_STATE_RULES: SeedTask[] = [
  // Weekday recurring engine
  {
    title: "Morning Protocol: Hydration, Conditioning & Day Plan",
    category: "Routine",
    priority: "high",
    is_recurring: true,
    recurrence_rule: "weekday",
    default_duration_minutes: 45,
    notes: "Hydrate, cold shower, push-ups/stretches, inspect today's DO OR DIE target list."
  },
  {
    title: "Deep Work Block 1: Core Systems Engineering / ML",
    category: "Projects",
    priority: "high",
    is_recurring: true,
    recurrence_rule: "weekday",
    default_duration_minutes: 150, // 2.5 hours
    notes: "2.5 hours uninterrupted focus. Zero distractions, phone in another room."
  },
  {
    title: "LeetCode Topic Rotation: Daily 2 Problems",
    category: "LeetCode",
    priority: "high",
    is_recurring: true,
    recurrence_rule: "weekday",
    default_duration_minutes: 45,
    notes: "Follow the 9-topic rotational order. Focus on pattern intuition and optimal time complexity."
  },
  {
    title: "Deep Work Block 2: Security Labs / CS50 / Specialized Project",
    category: "Security",
    priority: "high",
    is_recurring: true,
    recurrence_rule: "weekday",
    default_duration_minutes: 150, // 2.5 hours
    notes: "2.5 hours deep dive into security challenges, systems software, or active project roadmap."
  },
  {
    title: "Evening Shutdown: Daily Reflection & Tomorrow Prep",
    category: "Routine",
    priority: "medium",
    is_recurring: true,
    recurrence_rule: "weekday",
    default_duration_minutes: 30,
    notes: "Write daily note, log actual minutes, check pending items, lock down tomorrow's tasks."
  },

  // Weekend recurring engine
  {
    title: "Saturday Hackathon Block: Unbroken Project Sprint",
    category: "Projects",
    priority: "high",
    is_recurring: true,
    recurrence_rule: "saturday",
    default_duration_minutes: 180, // 3 hours
    notes: "3-hour deep building sprint on production projects."
  },
  {
    title: "Weekend LeetCode Challenge: Hard Problem or Biweekly Contest",
    category: "LeetCode",
    priority: "high",
    is_recurring: true,
    recurrence_rule: "weekend",
    default_duration_minutes: 60,
    notes: "Timed contest problem or mock interview question under pressure."
  },
  {
    title: "Security & CTF Sprint: Pwn.college / Reverse Engineering",
    category: "Security",
    priority: "medium",
    is_recurring: true,
    recurrence_rule: "weekend",
    default_duration_minutes: 120,
    notes: "Exploit development, binary analysis, CTF challenges."
  },
  {
    title: "🎯 Sunday Catch-up & Rollover Clearance Engine",
    category: "Routine",
    priority: "high",
    is_recurring: true,
    recurrence_rule: "sunday",
    default_duration_minutes: 120,
    notes: "Clear all tasks rolled over from the week. Enforce zero pending backlog."
  },
  {
    title: "Weekly Planning, Metrics Review & Architecture Reset",
    category: "Routine",
    priority: "medium",
    is_recurring: true,
    recurrence_rule: "sunday",
    default_duration_minutes: 45,
    notes: "Review completion rate, streak status, adjust upcoming week blocks."
  }
];
