# TorahCards Backend

A concept-driven backend API server built with [Deno](https://deno.com) and [Hono](https://hono.dev/), implementing a modular architecture for a flashcard and note-taking application for different Torah topics.

## 🎯 Overview

TorahCards is a backend system designed around the concept design methodology from MIT 6.104. The application provides a RESTful API for managing flashcards, notes, user authentication, following relationships, through independently implemented "concepts."

## assignment 4c links:
- [Screen Recording](Final-Screen-Recording.mov)
- [Screen Recording Trace](Screen-Recording-trace.md)
- [Final Design Doc](FinalDesignDoc.md)
- [Reflections Document](reflections.md)

## ✨ Features

### Implemented Concepts

- **FlashCards**: Create and manage flashcard sets with questions and answers
- **Notes**: Create, organize, and search personal notes
- **UserAuth**: User authentication and session management
- **Following**: Social following relationships between users
- **Labeling**: Tag and categorize content (backend ready)

### Key Capabilities

- 🔍 Full-text search for flashcards and notes
- 👥 User authentication with session management
- 🔗 Content following system
- 🗄️ MongoDB integration for data persistence
- 🤖 AI-powered features via Google Gemini API
- 🚀 Auto-discovered concept routing

## 🛠️ Tech Stack

- **Runtime**: [Deno](https://deno.com) 2.x
- **Web Framework**: [Hono](https://hono.dev/)
- **Database**: MongoDB Atlas
- **AI Integration**: Google Gemini API
- **Testing**: Deno's built-in test framework
- **Design Tool**: Context tool (custom Markdown-based LLM collaboration)

## 📋 Prerequisites

- [Deno](https://deno.com) installed (v2.0 or higher)
- MongoDB Atlas account (free tier available)
- Google Gemini API key (optional, for AI features)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/bzgrey/TorahCards.git
cd TorahCards-backend
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Gemini API Configuration (optional)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# MongoDB Configuration
MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=torahcards
```

### 3. Configure MongoDB Atlas

1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account
2. Create a free M0 cluster
3. Configure network access to allow all IPs (0.0.0.0/0)
4. Create a database user with read/write permissions
5. Get your connection string and add it to `.env`

### 4. Install the Context CLI Tool (Optional)

For design documentation and LLM collaboration:

```bash
deno compile -A --output ctx .ctx/context.ts
```

### 5. Run the Server

```bash
deno task concepts
```

The server will start on `http://localhost:8000` by default.

## 📖 API Documentation

The API follows a consistent pattern: `POST /api/{ConceptName}/{actionName}`

### Example Endpoints

#### FlashCards Concept
- `POST /api/FlashCards/addFlashcards` - Create a new flashcard set
- `POST /api/FlashCards/addCard` - Add a card to an existing set
- `POST /api/FlashCards/getUserCards` - Get all flashcard sets for a user
- `POST /api/FlashCards/searchFlashcards` - Search flashcards by name

#### Notes Concept
- `POST /api/Notes/addNote` - Create a new note
- `POST /api/Notes/editNote` - Edit an existing note
- `POST /api/Notes/deleteNote` - Delete a note
- `POST /api/Notes/searchNotes` - Search notes by content

#### UserAuth Concept
- `POST /api/UserAuth/register` - Register a new user
- `POST /api/UserAuth/login` - Authenticate a user
- `POST /api/UserAuth/logout` - End a user session

#### Following Concept
- `POST /api/Following/follow` - Follow another user
- `POST /api/Following/unfollow` - Unfollow a user
- `POST /api/Following/getFollowers` - Get list of followers
- `POST /api/Following/getFollowing` - Get list of users being followed

### Request/Response Format

All endpoints accept and return JSON. Request bodies vary by endpoint but typically include relevant concept parameters.

**Example Request:**
```json
POST /api/FlashCards/addFlashcards
{
  "user": "user123",
  "name": "Hebrew Vocabulary",
  "cards": [
    { "question": "שלום", "answer": "Peace/Hello" },
    { "question": "תודה", "answer": "Thank you" }
  ]
}
```

## 🧪 Testing

Run all tests:

```bash
deno test -A
```

Run a specific test file:

```bash
deno test -A src/concepts/FlashCards/FlashCardsConcept.test.ts
```

Tests use Deno's built-in testing framework and automatically set up/tear down test databases.

## 🏗️ Project Structure

```
TorahCards-backend/
├── src/
│   ├── concept_server.ts         # Main server with auto-discovery
│   ├── concepts/                  # Concept implementations
│   │   ├── FlashCards/
│   │   │   ├── FlashCardsConcept.ts
│   │   │   └── FlashCardsConcept.test.ts
│   │   ├── Notes/
│   │   ├── UserAuth/
│   │   ├── Following/
│   │   └── Labeling/
│   └── utils/
│       ├── database.ts            # MongoDB connection
│       ├── gemini-llm.ts          # AI integration
│       └── types.ts               # Shared type definitions
├── design/                        # Concept specifications
│   ├── background/                # Design methodology docs
│   ├── concepts/                  # Individual concept specs
│   └── learning/                  # Design decisions log
├── context/                       # Design history (immutable)
├── deno.json                      # Deno configuration
├── geminiConfig.json              # AI model configuration
└── .env                           # Environment variables
```

## 🎨 Design Methodology

This project uses the **Context** framework for concept-driven design:

- Each concept is independently specified, implemented, and tested
- Design documentation lives alongside code in the `design/` directory
- The `context/` directory maintains an immutable history of design decisions
- LLM collaboration is integrated through the Context CLI tool

### Adding a New Concept

1. Create a specification in `design/concepts/{ConceptName}/`
2. Implement in `src/concepts/{ConceptName}/{ConceptName}Concept.ts`
3. Export the class as default
4. Add tests in `{ConceptName}Concept.test.ts`
5. The server will auto-discover and route your concept!

**Example Concept Class:**

```typescript
export default class MyConceptConcept {
  constructor(private db: Db) {}
  
  async myAction(params: { /* ... */ }) {
    // Implementation
    return { success: true };
  }
}
```

## 🔧 Configuration

### Server Options

Customize server behavior via command-line flags:

```bash
deno run --allow-net --allow-read --allow-sys --allow-env src/concept_server.ts \
  --port 3000 \
  --baseUrl /api/v1
```

### Gemini AI Configuration

Edit `geminiConfig.json` to adjust AI behavior:

```json
{
  "temperature": 0.7,
  "topK": 40,
  "topP": 0.95,
  "maxOutputTokens": 8192
}
```

## 🤝 Contributing

This is an educational project for MIT 6.104. For course-related contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes following the concept design methodology
4. Add tests for new functionality
5. Submit a pull request

## 🙏 Acknowledgments

- MIT 6.104 course staff for the concept design framework
- Context tool for design-driven development
- Deno team for an excellent runtime
- MongoDB for reliable data persistence

## 📬 Contact

**Repository**: [github.com/bzgrey/TorahCards-backend](https://github.com/bzgrey/TorahCards-backend)

---
