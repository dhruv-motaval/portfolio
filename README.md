# Dhruv Motaval — Portfolio

This repository contains the source for my portfolio website. The project cards in `index.html` are ordered to show my strongest end-to-end product, backend, and AI work first.

## Featured projects

1. **[Expense Claims System](https://github.com/dhruv-motaval/expense-claims-system)** — Next.js + FastAPI + PostgreSQL expense workflow, receipt extraction, server-side role/team permissions, duplicate detection, duplicate-payment prevention, spend limits, audit trail, and local/S3 storage. Payment is simulated; authentication is demo-only.
2. **[ExplainOps](https://github.com/dhruv-motaval/ExplainOps)** — FastAPI incident triage using simulated event streams, scikit-learn ranking, deterministic fallback scoring, grounded LLM explanations, a feedback loop, and GitHub Actions CI.
3. **[ZENO](https://github.com/dhruv-motaval/zeno)** — Node.js/Express and MongoDB/EJS web application for Valorant player stats, match history, leaderboards, maps, weapons, and guides. Authentication is basic scaffolding.
4. **[RAG Document Q&A & Retrieval Evaluation](https://github.com/dhruv-motaval/Agentic-RAG)** — FastAPI, Qdrant, BM25/RRF hybrid retrieval, cross-encoder reranking, page citations, evaluation harness, and LangSmith tracing. The repo's 29-answerable-question golden set reports Recall@4/MRR/NDCG@4 of 1.000; results are limited to that small test set. [Live demo](https://huggingface.co/spaces/MotavalD/Rag-Document-Qa).
5. **[Real-Time Multilingual Call Resolution](https://github.com/dhruv-motaval/Real-Time-Multilingual-Call-Resolution-MyOnSite)** — Whisper transcription, spaCy language detection, rule-based intent recognition, deterministic routing, audit history, and event replay through FastAPI/LangGraph.
6. **[Stroke Risk Prediction API](https://github.com/dhruv-motaval/Stroke-Prediction-API)** — classical ML model exposed through FastAPI, with preprocessing and class-imbalance handling. [Demo](https://huggingface.co/spaces/MotavalD/Stroke_Prediction).

## Additional projects

- [NomadicOS](https://github.com/dhruv-motaval/NomadicOS) — a controlled-execution foundation for local-first AI orchestration; some desktop and memory capabilities remain in development.
- [Self-Evaluating Lesson Generator](https://github.com/dhruv-motaval/self-evaluating-lesson-generator) — LangGraph-based generation, six-check evaluation, bounded retries, and persistent SQLite memory.
- [Northstar One AI Sales Agent](https://github.com/dhruv-motaval/northstar-one-agent) — lead qualification and objection handling; booking is simulated.
- [Auto-MOM](https://github.com/dhruv-motaval/Auto-MOM) — meeting audio transcription and PDF minutes.

## Stack represented in these projects

Python, JavaScript, Next.js, Node.js, Express.js, FastAPI, PostgreSQL, MongoDB, SQLAlchemy, Mongoose, LangChain, LangGraph, scikit-learn, Qdrant, Docker, GitHub Actions, and AWS S3.

Project-specific limitations are stated where relevant; demo code should not be mistaken for production-scale deployment.
