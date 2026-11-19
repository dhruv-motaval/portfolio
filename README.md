# Dhruv Motaval — Portfolio

This repository contains the source for my portfolio website. The project cards in `index.html` are ordered to show my strongest end-to-end product, backend, and AI work first.

## Featured projects

1. **[Expense Claims System](https://github.com/dhruv-motaval/expense-claims-system)** — Next.js + FastAPI + PostgreSQL expense workflow, server-side role/team permissions, duplicate detection, duplicate-payment prevention, spend limits, audit trail, Gemini receipt extraction, hot local/MinIO to cold S3 receipt storage, and 72 tests. Payment is simulated; authentication is demo-only. [Live demo](https://expense-claims-system.vercel.app).
2. **[ShareDoc](https://github.com/dhruv-motaval/sharedoc)** — React/Tiptap + Express collaborative document editor with .docx/.md/.txt import, viewer/editor sharing, and SQLite (Turso in production). Auth is mocked; no real-time co-editing. [Live demo](https://sharedoc-six.vercel.app).
3. **[Wind Signal](https://github.com/dhruv-motaval/khxm293j)** — React + FastAPI workbench measuring GB day-ahead wind forecast accuracy from Elexon FUELHH/WINDFOR data with a configurable decision cutoff, MAE/RMSE/bias/MAPE, and CSV export. [Live demo](https://khxm293j-mdtk.vercel.app/).
4. **[ExplainOps](https://github.com/dhruv-motaval/ExplainOps)** — FastAPI incident triage using simulated event streams, scikit-learn ranking, deterministic fallback scoring, grounded LLM explanations, a feedback loop, and GitHub Actions CI.
5. **[FotoOwl Reel](https://github.com/dhruv-motaval/fotoowl-reel)** — LangGraph multi-agent pipeline turning photos plus a creative brief into a Remotion video, with RAG-grounded storyboarding and code generation and a self-correcting compile loop.
6. **[ZENO](https://github.com/dhruv-motaval/zeno)** — Node.js/Express and MongoDB/EJS web application for Valorant player stats, match history, leaderboards, maps, weapons, and guides. Authentication is basic scaffolding.
7. **[RAG Document Q&A & Retrieval Evaluation](https://github.com/dhruv-motaval/Agentic-RAG)** — FastAPI, Qdrant, BM25/RRF hybrid retrieval, cross-encoder reranking, page citations, evaluation harness, and LangSmith tracing. The repo's 29-answerable-question golden set reports Recall@4/MRR/NDCG@4 of 1.000; results are limited to that small test set. [Live demo](https://huggingface.co/spaces/MotavalD/Rag-Document-Qa).
8. **[Real-Time Multilingual Call Resolution](https://github.com/dhruv-motaval/Real-Time-Multilingual-Call-Resolution-MyOnSite)** — Whisper transcription, spaCy language detection, rule-based intent recognition, deterministic routing, audit history, and event replay through FastAPI/LangGraph.
9. **[Stroke Risk Prediction API](https://github.com/dhruv-motaval/Stroke-Prediction-API)** — classical ML model exposed through FastAPI, with preprocessing and class-imbalance handling. [Demo](https://huggingface.co/spaces/MotavalD/Stroke_Prediction).

## Additional projects

- [NomadicOS](https://github.com/dhruv-motaval/NomadicOS) — local-first AI orchestration with owner-authorized execution and goal verification; first verified research → code → run mission on a local 8B model. Desktop UI Automation, parallel missions, and a React dashboard are in progress.
- [Self-Evaluating Lesson Generator](https://github.com/dhruv-motaval/self-evaluating-lesson-generator) — LangGraph-based generation, six-check evaluation, bounded retries, and persistent SQLite memory.
- [Northstar One AI Sales Agent](https://github.com/dhruv-motaval/northstar-one-agent) — lead qualification and objection handling; booking is simulated.
- [Auto-MOM](https://github.com/dhruv-motaval/Auto-MOM) — meeting audio transcription and PDF minutes.
- [LangGraph Multi-Agent Call Classifier](https://github.com/dhruv-motaval/multilingual-call-classifier) — Whisper → translate → spaCy → structured classification, then a tool-calling agent that acts on the result.
- [LangGraph Tool-Calling Agent](https://github.com/dhruv-motaval/LangGraph-Tool-Calling-Agent) — minimal agent loop from LangGraph primitives with checkpointed memory.
- [LangChain Groq Chatbot](https://github.com/dhruv-motaval/langchain-groq-chatbot) — streaming LCEL chatbot with personas. [Demo](https://huggingface.co/spaces/MotavalD/LangChain-Groq-Chatbot).

## Stack represented in these projects

Python, JavaScript, TypeScript, React, Next.js, Node.js, Express.js, FastAPI, PostgreSQL, MongoDB, SQLAlchemy, Mongoose, LangChain, LangGraph, scikit-learn, Qdrant, Docker, GitHub Actions, Vercel, and AWS S3.

Project-specific limitations are stated where relevant; demo code should not be mistaken for production-scale deployment.
