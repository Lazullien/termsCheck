import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

function TermsDisplay({ content }) {
  return (
    <Paper
      elevation={1}
      sx={{
        width: '100%',
        height: '200px',
        mb: 2,
        backgroundColor: '#f8f9fa',
        overflow: 'hidden',
        borderRadius: 1
      }}
    >
      <Box
        sx={{
          height: '100%',
          p: 2,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '4px',
          },
        }}
      >
        <Typography
          variant="body2"
          component="pre"
          sx={{
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: '0.875rem',
            color: '#333',
            userSelect: 'none'
          }}
        >
          {content || 'No terms and conditions loaded.'}
        </Typography>
      </Box>
    </Paper>
  );
}

export default TermsDisplay; 