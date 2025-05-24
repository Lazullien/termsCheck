import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Stack
} from '@mui/material';

const MultipleChoiceQuestion = ({ 
  question, 
  choices, 
  correctAnswerIndex, 
  onCorrectAnswer,
  onIncorrectAnswer 
}) => {
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [incorrectAttempts, setIncorrectAttempts] = useState(new Set());

  // Reset state when question changes
  useEffect(() => {
    setError(false);
    setSubmitted(false);
    setIncorrectAttempts(new Set());
  }, [question, choices]);

  console.log('MultipleChoiceQuestion props:', {
    question,
    choices,
    correctAnswerIndex
  });

  const handleChoiceClick = (selectedIndex) => {
    const isCorrect = selectedIndex === correctAnswerIndex;

    if (isCorrect) {
      setSubmitted(true);
      setError(false);
      onCorrectAnswer();
    } else {
      setIncorrectAttempts(prev => new Set([...prev, selectedIndex]));
      setError(true);
      onIncorrectAnswer();
    }
  };

  if (!choices || choices.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
          Loading choices...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
        Original Statement:
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, pl: 2 }}>
        {question}
      </Typography>

      <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
        Please select the option that has the closest meaning to the original statement:
      </Typography>

      <Stack spacing={2} sx={{ mb: 2 }}>
        {choices.map((choice, index) => (
          <Button
            key={index}
            variant="outlined"
            fullWidth
            onClick={() => handleChoiceClick(index)}
            disabled={submitted || incorrectAttempts.has(index)}
            sx={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              textTransform: 'none',
              py: 1.5,
              px: 2,
              backgroundColor: incorrectAttempts.has(index) ? 'error.light' :
                             submitted && index === correctAnswerIndex ? 'success.light' : 
                             'inherit',
              '&:hover': {
                backgroundColor: incorrectAttempts.has(index) ? 'error.light' :
                               submitted && index === correctAnswerIndex ? 'success.light' : 
                               undefined
              },
              color: incorrectAttempts.has(index) ? 'white' :
                    submitted && index === correctAnswerIndex ? 'white' : 
                    undefined,
              borderColor: incorrectAttempts.has(index) ? 'error.main' :
                          submitted && index === correctAnswerIndex ? 'success.main' : 
                          undefined
            }}
          >
            <Typography variant="body2">
              {String.fromCharCode(65 + index)}. {choice}
            </Typography>
          </Button>
        ))}
      </Stack>

      {error && !submitted && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Incorrect. Please try another option that best matches the original statement.
        </Alert>
      )}

      {submitted && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Correct! This option best matches the original statement.
        </Alert>
      )}
    </Box>
  );
};

export default MultipleChoiceQuestion;
