# termCheck

An interactive terms and conditions verification system that ensures users understand key points and are informed in a direction through an engaging test interface.

## Overview

termCheck is supposed to be a government enforced extension that ensures companies don't misinform or doublespeak within terms and conditions
1. It generates questions extract from the terms and conditions based on user request (finance, privacy, etc.)
2. It generates questions requiring paraphrase or multiple choice questions (all using AI)
3. After completing the questions, the user is supposed to be allowed to proceed

## Features

### Dynamic Content Processing
- Users can input specific themes to focus the verification process
- AI-powered content analysis and question generation
- Real-time theme processing with visual feedback

### Verification Stages
1. **Paraphrase Test**: Users demonstrate understanding by rephrasing key statements
2. **Multiple Choice**: Verify comprehension through targeted questions

### Modern UI Components
- Clean, minimalist design with Material-UI
- Responsive layout with smooth transitions
- Interactive loading states and animations
- Progress tracking through linear progress bar

### Security & Validation
- Session-based verification
- Input validation and error handling
- Secure API communication

## Technical Stack

- **Frontend**: React with Material-UI
- **State Management**: React Hooks
- **API Integration**: Axios
- **UI/UX**: Custom styled components with MUI theming
- **Backend Communication**: RESTful API endpoints

## Key Components

- `ThemeInput`: Handles theme submission and processing
- `MultipleChoiceQuestion`: Manages quiz-style verification
- `TermsDisplay`: Renders terms and conditions content
- `Dialog`: Manages the verification test interface

## Usage Flow

1. User enters a theme for content focus
2. System generates relevant verification content
3. User progresses through three verification stages:
   - Paraphrase a key statement
   - Answer multiple-choice questions
   - Complete final verification
4. Success confirmation upon completion

## API Integration

The system integrates with a backend service for:
- Content generation
- Answer verification
- Multiple choice question generation

## Performance

- Minimal re-renders
- Responsive design for all devices
- Mainly slow due to current AI api
