# 🚀 ASTROQUERY - NASA Space Biology Research Dashboard

> AI-powered research exploration platform for space biology publications

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/flask-2.0%2B-green.svg)](https://flask.palletsprojects.com/)
[![Vite](https://img.shields.io/badge/vite-5.4%2B-purple.svg)](https://vitejs.dev/)

---

## 📖 Overview

**ASTROQUERY** is a comprehensive web application designed for NASA Space Apps Challenge participants and space biology researchers. It provides intelligent search, AI-powered analysis, and interactive visualization of scientific publications in space biology.

### ✨ Key Features

- **🔍 Semantic Search** - Find research papers using natural language queries powered by vector embeddings
- **💬 AI Chat Assistant** - Ask questions about space biology research and get AI-generated answers with citations
- **🧠 Deep Research Analysis** - Analyze research papers for originality, methodology, and scientific contribution
- **🕸️ Knowledge Graph** - Visualize relationships between entities, research topics, and publications
- **📚 Interactive Learning** - Educational modules with quizzes on space biology topics
- **🔬 Entity Extraction** - Automatically extract organisms, interventions, and outcomes from publications
- **📊 Trend Analysis** - Discover research trends and identify knowledge gaps

---

## 🛠️ Tech Stack

### Frontend
- **Vite** - Fast build tool and dev server
- **Vanilla JavaScript (ES6)** - Modular, modern JavaScript
- **HTML5/CSS3** - Responsive, accessible UI
- **WebGL** - Interactive 3D visualizations

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **FAISS** - Fast vector similarity search
- **Sentence Transformers** - Semantic text embeddings
- **SpaCy** - Natural language processing
- **BeautifulSoup4** - Web scraping for publications
- **OpenRouter** - LLM API integration

### Database
- **SQLite** - Lightweight relational database

### External APIs
- **OpenRouter** - AI/LLM services (GPT-4.1-mini)
- **NCBI PubMed Central** - Scientific publication data

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Node.js 16+** and npm ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### API Keys Required

You'll need the following API keys:

1. **OpenRouter API Key**
   - Sign up at [https://openrouter.ai](https://openrouter.ai)
   - Used for AI chat, summarization, and entity extraction

2. **NCBI API Key** (Optional but recommended)
   - Register at [https://www.ncbi.nlm.nih.gov/account/](https://www.ncbi.nlm.nih.gov/account/)
   - Increases rate limits for PubMed Central data access

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Amadan04/NASA-dashboard.git
cd NASA-dashboard
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Download SpaCy language model
python -m spacy download en_core_web_sm

# Set up environment variables
copy .env.example .env
# Edit .env and add your API keys
```

### 3. Frontend Setup

```bash
# Navigate back to root directory
cd ..

# Install Node.js dependencies
npm install

# Create frontend environment file (optional)
# Copy .env.example to .env if you need custom API base URL
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the **`backend`** directory with the following:

```bash
# Flask Configuration
FLASK_ENV=development
PORT=5000
DEVICE=cpu

# Database
DATABASE_URL=sqlite:///./biodash.db

# Vector Search
FAISS_INDEX_PATH=./biodash_faiss.index
EMBEDDINGS_NPY_PATH=./biodash_embeddings.npy
ID_MAP_NPY_PATH=./biodash_idmap.npy

# API Keys (REQUIRED)
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_URL=https://openrouter.ai/api/v1/chat/completions
NCBI_API_KEY=your_ncbi_key_here
```

> ⚠️ **Security:** Never commit your `.env` file to version control!

---

## ▶️ Running the Application

### Development Mode

You need to run both the backend and frontend simultaneously.

#### Terminal 1: Start Backend

```bash
cd backend

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Start Flask server
python app.py
```

The backend will start on `http://localhost:5000`

#### Terminal 2: Start Frontend

```bash
# In the root directory
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

Open your browser and navigate to the URL shown in the terminal.

---

## 📁 Project Structure

```
NASA-dashboard/
├── backend/                          # Backend (Python Flask)
│   ├── app.py                        # Main Flask application
│   ├── config.py                     # Configuration loader
│   ├── models.py                     # Database models
│   ├── db.py                         # Database session factory
│   ├── vector_engine.py              # FAISS vector search
│   ├── trends.py                     # Trend analysis
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Environment template
│   ├── process/                      # AI processing pipelines
│   │   ├── ai_pipeline.py           # LLM integration
│   │   ├── education_pipeline.py    # Learning content generation
│   │   └── deep_research.py         # Research analysis
│   ├── ingest/                       # Data ingestion
│   │   └── scrape_pmc_xml.py        # PubMed scraper
│   ├── utils/                        # Helper functions
│   │   ├── text_clean.py
│   │   └── nlp_clean.py
│   └── migrations/                   # Database migrations
│
├── frontend/                         # Frontend application
│   ├── src/                          # Source files
│   │   ├── *.js                      # JavaScript modules
│   │   └── *.css                     # Stylesheets
│   └── public/                       # Static assets
│       └── assets/                   # Images, icons
│
├── docs/                             # Documentation
│   ├── QUICK_START_GUIDE.md         # Quick setup guide
│   ├── PRE_PUBLICATION_CHECKLIST.md # Detailed checklist
│   ├── CHANGES_SUMMARY.md           # Change log
│   └── FINAL_ACTIONS_REQUIRED.md    # Action items
│
├── index.html                        # Main HTML entry point
├── package.json                      # Node.js dependencies
├── .env.example                      # Frontend env template
├── .gitignore                        # Git ignore rules
├── README.md                         # This file
├── LICENSE                           # MIT License
├── SECURITY.md                       # Security policy
├── setup.bat                         # Windows setup script
└── setup.sh                          # Linux/Mac setup script
```

---

## 🎯 Usage Guide

### 1. Search Publications

- Navigate to the **Search** tab
- Enter a natural language query (e.g., "effects of microgravity on bone density")
- Use filters to narrow by year range, journal, or section type
- Click on results to view full publication details

### 2. AI Chat

- Click the chat icon in the bottom-left corner or navigate to the **AI Chat** tab
- Ask questions about space biology research
- The AI will provide answers with citations to relevant publications

### 3. Deep Research Analysis

- Go to the **Deep Research Intelligence** tab
- Enter your research paper title and sections (Abstract, Methods, Results, etc.)
- Submit for AI-powered originality and methodology analysis
- Get detailed feedback on scientific contribution

### 4. Knowledge Graph

- Navigate to the **Knowledge Graph** tab
- Explore entities and relationships extracted from publications
- Visualize connections between organisms, interventions, and outcomes

### 5. Learning Modules

- Go to the **Learn** tab
- Browse topics and difficulty levels
- Complete lessons and quizzes to earn badges
- Track your progress and streaks

---

## 🔒 Security Considerations

### For Contributors:

- Never commit `.env` files
- Use `.env.example` templates only
- Rotate API keys if accidentally exposed
- Review `.gitignore` before committing

### For Users:

- Keep your API keys private
- Don't share your `.env` file
- Use environment variables for all sensitive configuration

---

## 📊 Data Sources

This application uses:

- **PubMed Central (PMC)** - Open-access scientific publications
- **NCBI E-utilities API** - Publication metadata and full-text XML
- Publications are indexed locally using FAISS for semantic search

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines:

- Follow PEP 8 for Python code
- Use ESLint for JavaScript
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **NASA Space Apps Challenge** - For inspiration and challenge framework
- **OpenRouter** - For AI/LLM API services
- **NCBI PubMed Central** - For open-access publication data
- **Sentence Transformers** - For semantic embeddings
- **FAISS** - For efficient vector search

---

## 📞 Support

If you encounter any issues or have questions:

- Open an issue on [GitHub Issues](https://github.com/Amadan04/NASA-dashboard/issues)
- Check existing documentation
- Review the `.env.example` file for configuration help

---

## 🗺️ Roadmap

- [ ] User authentication and personalization
- [ ] Export research findings to PDF
- [ ] Advanced visualization options
- [ ] Integration with additional publication databases
- [ ] Mobile-responsive improvements
- [ ] Docker containerization
- [ ] Cloud deployment guides

---

**Built with ❤️ for NASA Space Apps Challenge**