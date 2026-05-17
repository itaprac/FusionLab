# Fusion Lab

[![CI](https://github.com/itaprac/FusionLab/actions/workflows/ci.yml/badge.svg)](https://github.com/itaprac/FusionLab/actions/workflows/ci.yml)
[![Railway Deploy](https://github.com/itaprac/FusionLab/actions/workflows/railway-deploy.yml/badge.svg)](https://github.com/itaprac/FusionLab/actions/workflows/railway-deploy.yml)
[![Website](https://img.shields.io/badge/Website-fusionlab--production.up.railway.app-blue)](https://fusionlab-production.up.railway.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> **Interactive platform for Dempster-Shafer evidence fusion and ML classifier ensemble analysis.**

Fusion Lab is a full-stack web application that implements the **Dempster-Shafer theory of evidence** and **Proportional Conflict Redistribution (PCR5, PCR6)** rules for combining uncertain information from multiple sources. Beyond the core fusion calculator, it provides a complete **machine learning pipeline** that trains multiple classifiers, converts their probability outputs into belief mass functions (BBAs), and fuses predictions to evaluate whether evidence-theoretic combination improves classification accuracy over individual models or majority voting.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Railway Deployment](#railway-deployment)
- [API Overview](#api-overview)
- [Fusion Methods](#fusion-methods)
- [Project Structure](#project-structure)
- [License](#license)

## Features

### Fusion Calculator
- **Multiple fusion rules** — Dempster's rule, PCR5, PCR6, Yager's rule, Dubois-Prade, disjunctive consensus, and more
- **Interactive source management** — Add any number of sources with custom hypotheses and belief mass assignments
- **Conflict analysis** — View the conflict coefficient between sources
- **Pignistic transformation** — Get decision-ready probability scores from fused belief masses
- **Pre-built examples** — Load ready-to-use scenarios (low conflict, high conflict, real-world use cases like avalanche hazard assessment)
- **Code export** — Generate standalone Python scripts for any fusion calculation

### ML Fusion Pipeline
- **Built-in datasets** — Iris, Heart Disease, and more
- **Custom dataset upload** — Import your own CSV files with automatic column type detection
- **Multiple classifiers** — Logistic Regression, Random Forest, SVM, KNN, Naive Bayes, Gradient Boosting, and others with configurable hyperparameters
- **Evaluation modes** — Holdout split (75/25) or k-fold cross-validation
- **Fusion vs baseline comparison** — See how fused predictions compare against each individual model and majority voting
- **Sample-level analysis** — Inspect exactly which test samples were correctly/incorrectly classified by fusion vs best model, including "rescue" cases where all individual models were wrong but fusion was correct
- **Combination search** — Automatically evaluate all model subsets (≥2) × fusion rules to find the optimal combination
- **Streaming progress** — Real-time NDJSON progress updates during search
- **Confusion matrix** — Visualize fusion classification performance
- **Code export** — Generate reproducible Python notebooks for any ML fusion experiment

## Getting Started

### Prerequisites

- **Python 3.13+** with [`uv`](https://github.com/astral-sh/uv) package manager
- **Node.js 18+** with npm

### Backend

```bash
cd backend
uv venv
source .venv/bin/activate        # On Windows: .venv\Scripts\activate
uv pip install -e .
uvicorn main:app --reload
```

The API server starts at `http://localhost:8000`. Interactive API docs are available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The application opens at `http://localhost:5173`.

## Railway Deployment

Fusion Lab can run on Railway as one Dockerized service: the Vite frontend is built into static assets, FastAPI serves those assets, and browser API calls use the `/api/*` prefix on the same domain.

Railway uses the repository-level [`Dockerfile`](./Dockerfile) and [`railway.toml`](./railway.toml). The production healthcheck is available at `/healthz`.

### Manual deploy from local CLI

```bash
railway link
railway up --detach -m "Deploy Fusion Lab"
```

### Deploy from GitHub Actions

The [`Railway Deploy`](./.github/workflows/railway-deploy.yml) workflow is manual by default. Add these repository secrets before running it:

| Secret | Required | Description |
|--------|----------|-------------|
| `RAILWAY_API_TOKEN` | Yes | Railway account/project token used by the CLI |
| `RAILWAY_PROJECT_ID` | Yes | Railway project ID to deploy into |
| `RAILWAY_SERVICE` | No | Service name if the project has more than one service |

The regular [`CI`](./.github/workflows/ci.yml) workflow checks the backend, builds the frontend, and builds the Railway Docker image.

## API Overview

### Fusion Calculator Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/methods` | List all available fusion rules with descriptions |
| `GET` | `/examples` | Get pre-built fusion examples |
| `POST` | `/fusion` | Fuse belief masses from multiple sources |
| `POST` | `/fusion/export-code` | Generate Python code for a fusion calculation |

### ML Pipeline Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/ml/datasets` | List built-in datasets |
| `GET` | `/ml/models` | List available classifiers with parameter schemas |
| `POST` | `/ml/datasets/preview` | Preview an uploaded CSV (columns, sample rows) |
| `POST` | `/ml/datasets/upload` | Upload and register a custom dataset |
| `POST` | `/ml/run` | Train models and run fusion on a built-in dataset |
| `POST` | `/ml/run-upload` | Train models and run fusion on an uploaded dataset |
| `POST` | `/ml/search` | Exhaustive search over model subsets × fusion rules |
| `POST` | `/ml/search-stream` | Same as `/ml/search` with NDJSON progress streaming |
| `POST` | `/ml/export-code` | Generate Python code for a built-in dataset experiment |
| `POST` | `/ml/export-code-upload` | Generate Python code for an uploaded dataset experiment |

## Fusion Methods

| Rule | Category | Description |
|------|----------|-------------|
| **Dempster** | Conjunctive | Classic Dempster's rule of combination with normalization |
| **PCR5** | Proportional | Proportional Conflict Redistribution — handles high conflict |
| **PCR6** | Proportional | Improved PCR variant for multiple sources |
| **Yager** | Conjunctive | Yager's rule — transfers conflict to ignorance |
| **Dubois-Prade** | Disjunctive | Disjunctive consensus rule |
| **Disjunctive** | Disjunctive | Full disjunctive combination |
| **Average** | Other | Simple arithmetic mean of belief masses |
| **Minimum** | Conjunctive | Conjunctive consensus (minimum operator) |

## Project Structure

```
FusionLab/
├── backend/
│   ├── main.py              # FastAPI application, all endpoints
│   ├── models.py            # Pydantic schemas
│   ├── belief_adapter.py    # Fusion engine wrapper
│   ├── ml_runtime.py        # ML dataset & classifier management
│   ├── ml_export.py         # Python code generation
│   ├── pyproject.toml       # Python dependencies
│   └── uv.lock              # Locked backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── locales/         # i18n translations (en, pl)
│   │   ├── remotion/        # Intro animation
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
└── README.md                # This file
```

## License

Fusion Lab is released under the [MIT License](./LICENSE).
