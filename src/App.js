import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  Paper,
  Alert,
  LinearProgress
} from '@mui/material';
import axios from 'axios';
import ThemeInput from './ThemeInput';
import TermsDisplay from './TermsDisplay';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import { getCookieValue } from './utils';
import {SAMPLE_CONTENT} from './ThemeInput.js';

function App() {
  const [open, setOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [verificationError, setVerificationError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);
  const [statements, setStatements] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [sampleContent, setSampleContent] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [theme, setTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState('.');
  const [multipleChoiceData, setMultipleChoiceData] = useState({
    question: '',
    choices: [],
    correctAnswerIndex: -1
  });
  const [preloadedMCQs, setPreloadedMCQs] = useState([]);
  const [submitLoadingDots, setSubmitLoadingDots] = useState('.');

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingDots(dots => dots.length >= 3 ? '.' : dots + '.');
      }, 500);
    } else {
      setLoadingDots('.');
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setSubmitLoadingDots(dots => dots.length >= 3 ? '.' : dots + '.');
      }, 500);
    } else {
      setSubmitLoadingDots('.');
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleThemeInput = ({ theme: newTheme }) => {
    setTheme(newTheme);
  };

  const handleThemeSubmit = async () => {
    if (!theme || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post('http://server.tsxc.xyz:8000/api/questions/', {
        message_request: theme,
        message_content: SAMPLE_CONTENT,
        session_id: getCookieValue('session_id')
      });
      
      if (response.data) {
        handleThemeGenerated(response.data).finally(() => {
          setIsLoading(false);
        });
      }
    } catch (error) {
      console.error('Error generating theme content (axios.post):', error);
      setIsLoading(false);
    }
  };

  const loadMultipleChoiceQuestion = async (statement) => {
    try {
      const response = await axios.post('http://server.tsxc.xyz:8000/api/get_mcq/', {
        question: statement,
        session_id: getCookieValue('session_id')
      });
      
      const result = JSON.parse(response.data);
      const choiceLetters = ['A', 'B', 'C', 'D'];
      const choices = choiceLetters.map(letter => result.response[letter].content);
      const correctAnswerIndex = choiceLetters.findIndex(letter => result.response[letter].right);
      
      return { choices, correctAnswerIndex };
    } catch (error) {
      console.error('Error loading multiple choice question:', error);
      return null;
    }
  };

  const handleThemeGenerated = async (content) => {
    try {
      

      // Parse statements and set them, enabling the button
      const parsedContent = JSON.parse(content);
      const originalStatements = parsedContent.response.list_answer_content;
      console.log(originalStatements);
      // Calculate actual number of runnable tests
      let runnableTestsCount = originalStatements.length>3?3:originalStatements.length;
      setTotalQuestions(runnableTestsCount);

      setStatements(originalStatements);

      // Determine potential number of tests based on statements
      const numPotentialTests = originalStatements.length < 3 ? originalStatements.length : 3;
      
      const mcqPromises = [];
      const newPreloadedMCQs = []; // Holds successfully loaded MCQ data, indexed by test number (2 or 3)

      // Add promise for Test 2 MCQ (from originalStatements[1])
      if (numPotentialTests >= 2 && originalStatements[1]) {
        mcqPromises.push(loadMultipleChoiceQuestion(originalStatements[1]));
      } else {
        mcqPromises.push(Promise.resolve(undefined)); // Placeholder if not needed or statement missing
      }

      // Add promise for Test 3 MCQ (from originalStatements[2])
      if (numPotentialTests >= 3 && originalStatements[2]) {
        mcqPromises.push(loadMultipleChoiceQuestion(originalStatements[2]));
      } else {
        mcqPromises.push(Promise.resolve(undefined)); // Placeholder if not needed or statement missing
      }

      // Concurrently fetch data for Test 2 and Test 3 MCQs
      const [mcqDataForTest2, mcqDataForTest3] = await Promise.all(mcqPromises);

      if (mcqDataForTest2) {
        newPreloadedMCQs[2] = mcqDataForTest2;
      }
      if (mcqDataForTest3) {
        newPreloadedMCQs[3] = mcqDataForTest3;
      }
      
      setPreloadedMCQs(newPreloadedMCQs);
      
      setSampleContent(content); // Enables the button via disabled={!sampleContent}

      
    } catch (error) {
      console.error('Error processing theme or loading MCQs:', error.message);
      // Reset states in case of error during initial processing or critical MCQ failure
      setSampleContent('');
      setStatements([]);
      setPreloadedMCQs([]);
      setTotalQuestions(0);
    }
  };

  const handleOpen = () => {
    if (!sampleContent) return; // Guard remains, if sampleContent is empty (e.g. due to error in handleThemeGenerated), don't open
    
    setOpen(true);
    setVerificationError(false);
    setUserInput('');
    setCurrentTest(1);
    setCompletedTests([]);
    
    // totalQuestions is now authoritatively set by handleThemeGenerated
    // No need to re-calculate or set statements here as they are already set
  };

  const handleClose = () => {
    setOpen(false);
    setUserInput('');
    setVerificationError(false);
    setCurrentTest(0);
    setCompletedTests([]);
    setMultipleChoiceData({
      question: '',
      choices: [],
      correctAnswerIndex: -1
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setVerificationError(false);
    
    try {
      const response = await axios.post('http://server.tsxc.xyz:8000/api/judge_answer/', {
        question: JSON.stringify({original_statements: statements}),
        answer: JSON.stringify({
            user_paraphrase: userInput
          }),
        session_id: getCookieValue('session_id')
      });

      // Wait for MCQloading to be false
      while (totalQuestions>1&&!preloadedMCQs[0]) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Check every 100ms
      }

      const result = JSON.parse(response.data);
      if (result.response.match) {
        setCompletedTests(prev => [...prev, currentTest]);
        setUserInput('');
        if (currentTest < totalQuestions) {
          // Set the MCQ data before changing the question
          if (currentTest === 1) {
            setMultipleChoiceData(preloadedMCQs[2]);
          }
          setCurrentTest(prev => prev + 1);
        }
      } else {
        setVerificationError(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setVerificationError(true);
    }
    setLoading(false);
  };

  const handleMultipleChoiceCorrect = async () => {
    setCompletedTests(prev => [...prev, currentTest]);
    if (currentTest < totalQuestions) {
      // If moving from question 2 to 3, reset the multiple choice data first
      if (currentTest === 2 && preloadedMCQs[3]) {
        // Force a reset by clearing and then setting the data
        setMultipleChoiceData({ choices: [], correctAnswerIndex: -1 });
        setTimeout(() => setMultipleChoiceData(preloadedMCQs[3]), 0);
      }
      setCurrentTest(prev => prev + 1);
    }
  };

  const handleMultipleChoiceIncorrect = () => {
    // The MultipleChoiceQuestion component handles showing the error
  };

  const allTestsPassed = completedTests.length === totalQuestions;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100vw',
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#ffffff'
    }}>
      <Box sx={{ 
        p: 2,
        flex: 1,
        width: '92%',
        maxWidth: '1400px',
        mx: 'auto',
        fontSize: '1rem',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap'
      }}>
        {SAMPLE_CONTENT}
      </Box>
        
      <Box sx={{ 
        borderTop: '1px solid rgba(0,0,0,0.1)',
        p: 3,
        bgcolor: '#ffffff'
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          maxWidth: '500px',
          mx: 'auto',
          p: 2.5,
          border: '2px solid rgba(0,0,0,0.15)',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          position: 'relative'
        }}>
          <Box sx={{ 
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            pl: 1.5
          }}>
            {/* Simple icon */}
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Box sx={{
                width: 14,
                height: 14,
                bgcolor: '#ffffff',
                borderRadius: 0.8
              }} />
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#000000'
              }}
            >
              termCheck test
            </Typography>
          </Box>

          <Box sx={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{ width: '92%' }}>
              <ThemeInput onThemeGenerated={handleThemeInput} />
            </Box>

            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              justifyContent: 'center'
            }}>
              <Button
                variant="contained"
                onClick={handleThemeSubmit}
                disabled={!theme || isLoading}
                sx={{ 
                  width: '150px',
                  height: '36px',
                  fontSize: '0.9rem',
                  borderRadius: '4px'
                }}
              >
                {isLoading ? `Loading${loadingDots}` : 'Set Theme'}
              </Button>

              <Button 
                variant="contained" 
                onClick={handleOpen}
                disabled={!sampleContent}
                sx={{ 
                  width: '150px',
                  height: '36px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  borderRadius: '4px',
                  bgcolor: sampleContent ? '#1976d2' : '#9e9e9e',
                  '&:hover': {
                    bgcolor: sampleContent ? '#1565c0' : '#9e9e9e'
                  }
                }}
              >
                Begin Test
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={open} 
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '80vh',
            minHeight: '500px',
            borderRadius: '4px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography variant="subtitle1">
            Verification Test {currentTest} of {totalQuestions}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 1, overflowY: 'auto' }}>
          {currentTest > 0 && !allTestsPassed && (
            <>
              <LinearProgress 
                variant="determinate" 
                value={(completedTests.length / totalQuestions) * 100} 
                sx={{ mb: 2 }}
              />
              {currentTest === 1 ? (
                <>
                  <Typography variant="body2" sx={{ mb: 1, fontSize: '0.875rem' }}>
                    Please paraphrase (may take time to load):
                  </Typography>
                  <Box sx={{ mb: 1, pl: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {statements[currentTest - 1]}
                    </Typography>
                  </Box>
                  <TextField
                    autoFocus
                    size="small"
                    margin="dense"
                    label="Your Paraphrase"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    value={userInput}
                    onChange={(e) => {
                      setUserInput(e.target.value);
                      setVerificationError(false);
                    }}
                    error={verificationError}
                    helperText={verificationError ? "That answer does not match the statement, please try again." : ""}
                    sx={{ mt: 0 }}
                  />
                </>
              ) : (
                <Box sx={{ minHeight: '400px' }}>
                  <MultipleChoiceQuestion
                    question={statements[currentTest - 1]}
                    choices={multipleChoiceData.choices}
                    correctAnswerIndex={multipleChoiceData.correctAnswerIndex}
                    onCorrectAnswer={handleMultipleChoiceCorrect}
                    onIncorrectAnswer={handleMultipleChoiceIncorrect}
                  />
                </Box>
              )}
            </>
          )}
          {allTestsPassed && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Congratulations! You have completed all verification tests.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
          {currentTest === 1 && !allTestsPassed && (
            <Button 
              onClick={handleSubmit} 
              color="primary" 
              variant="contained"
              disabled={loading || !userInput}
            >
              {loading ? `Checking${submitLoadingDots}` : 'Submit'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;