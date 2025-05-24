import React, { useState } from 'react';
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

function App() {
  const [open, setOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [verificationError, setVerificationError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);
  const [statements, setStatements] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [sampleContent, setSampleContent] = useState('');

  const handleThemeGenerated = (content) => {
    setSampleContent(content);
  };

  const handleOpen = async () => {
    if (!sampleContent) return;
    
    setOpen(true);
    setVerificationError(false);
    setUserInput('');
    setCurrentTest(1);
    setCompletedTests([]);

      
      let finalStatements = [];
      finalStatements = JSON.parse(sampleContent).response.list_answer_content;
      
      setStatements(finalStatements);
  };

  const handleClose = () => {
    setOpen(false);
    setUserInput('');
    setVerificationError(false);
    setCurrentTest(0);
    setCompletedTests([]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setVerificationError(false);
    
    try {
        const response = await axios.post('http://server.tsxc.xyz:8000/api/judge_answer', null, {
            params: {
                question: JSON.stringify({original_statements: statements}),
                answer : JSON.stringify({
                user_paraphrase: userInput
              }),
              session_id: 1
            }
          });

      const result = JSON.parse(response.data);
      if (result.response.match) {
        setCompletedTests(prev => [...prev, currentTest]);
        setUserInput('');
        if (currentTest < 3) {
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

  const allTestsPassed = completedTests.length === 3;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#f5f5f5'
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2,
          width: 'auto', 
          maxWidth: '400px',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: '1.1rem',
            mb: 0,
            textAlign: 'center',
            color: '#1976d2'
          }}
        >
          TermCheck
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <ThemeInput onThemeGenerated={handleThemeGenerated} />

          <Button 
            variant="contained" 
            onClick={handleOpen}
            disabled={!sampleContent}
            sx={{ 
              width: '100%',
              maxWidth: '300px',
              height: '48px',
              textTransform: 'none',
              fontSize: '0.95rem',
              borderRadius: '4px',
              bgcolor: sampleContent ? '#1976d2' : '#9e9e9e',
              '&:hover': {
                bgcolor: sampleContent ? '#1565c0' : '#9e9e9e'
              },
              alignSelf: 'center',
              mt: 0.5
            }}
          >
            Begin Test
          </Button>
        </Box>
      </Paper>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '400px',
            minHeight: '300px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography variant="subtitle1">
            Verification Test {currentTest} of 3
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          {currentTest > 0 && !allTestsPassed && (
            <>
              <LinearProgress 
                variant="determinate" 
                value={(completedTests.length / 3) * 100} 
                sx={{ mb: 1 }}
              />
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
                rows={2}
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
          )}
          {allTestsPassed && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Verification Complete
              </Typography>
              <Typography variant="body2">
                All tests passed successfully.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1 }}>
          <Button size="small" onClick={handleClose}>
            {allTestsPassed ? 'Close' : 'Cancel'}
          </Button>
          {!allTestsPassed && (
            <Button 
              size="small"
              onClick={handleSubmit} 
              variant="contained" 
              disabled={!userInput || loading}
            >
              {loading ? 'Verifying...' : 'Submit'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;