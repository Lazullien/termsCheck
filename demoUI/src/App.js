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

const SAMPLE_CONTENT = `亲爱的用户，欢迎您使用DeepSeek产品及服务！ 1.DeepSeek产品及服务由杭州深度求索人工智能基础技术研究有限公司、北京深度求索人工智能基础技术研究有限公司及其关联公司（以下简称"我们"或"深度求索"）共同所有和负责运营。在使用本服务前，请您务必仔细阅读并理解本《DeepSeek用户协议》（以下简称"本协议"）以及本平台的其他相关协议、政策或指引。2.您在使用本服务某一特定功能时，针对该特定功能可能会另有单独的协议、相关业务规则等（以下简称"具体协议"）。本协议与具体协议的内容存在冲突的，以具体协议的规定为准。所有前述条款和规则构成本协议不可分割的组成部分（以上通称"全部协议"），与本协议正文具有同等法律效力。 3.其中，《DeepSeek开放平台服务协议》作为一项具体协议及本协议的组成部分，特别适用于您使用本平台提供的应用程序编程接口（API）或其他开发者工具等开放平台服务。 4.关于我们如何收集、保护和使用个人信息的具体规则，请您仔细阅读《DeepSeek 隐私政策》。 5.我们特别提醒您在使用本服务之前认真阅读（未满18周岁的未成年人应在法定监护人陪同下阅读）、充分理解以上协议的全部条款，尤其是加粗显示的条款。当您通过网络页面点击确认、勾选等方式同意本协议或实际使用本服务时，均表示您与我们已就全部协议达成一致，6.您已接受所述的所有条款及其适用条件，同意受全部协议约束。如果您不同意全部协议的任一内容，或者无法准确理解我方对全部协议条款的解释，请点击不同意或停止使用本服务。`;

function App() {
  const [open, setOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [verificationError, setVerificationError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);
  const [statements, setStatements] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);

  const handleOpen = async () => {
    setOpen(true);
    setVerificationError(false);
    setUserInput('');
    setCurrentTest(1);
    setCompletedTests([]);
    
    try {
      const response = await axios.post('http://server.tsxc.xyz:8000/api/get_question', null, {
        params: {
          message_content: SAMPLE_CONTENT,
          number: 3,
          session_id: 1
        }
      });
      
      let finalStatements = [];
      if (response.data) {
        try {
        finalStatements = JSON.parse(response.data).response.list_answer_content;
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
        }
      }
      
      setStatements(finalStatements);
    } catch (error) {
      console.error('API Error:', error);
      setStatements([
        "第一个测试声明",
        "第二个测试声明",
        "第三个测试声明"
      ]);
    }
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
      <Paper elevation={3} sx={{ p: 3, width: 'auto', display: 'inline-block' }}>
        <Typography variant="h6" gutterBottom align="center">
          AI Content Analyzer
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleOpen}
          sx={{ 
            width: '302px',
            height: '76px',
            textTransform: 'none',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '3px'
          }}
        >
          Analyze Content
        </Button>
      </Paper>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Verification Test {currentTest} of 3
        </DialogTitle>
        <DialogContent>
          {currentTest > 0 && !allTestsPassed && (
            <>
              <LinearProgress 
                variant="determinate" 
                value={(completedTests.length / 3) * 100} 
                sx={{ mb: 2 }}
              />
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
                Please paraphrase the following statement (May take time to load):
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {statements[currentTest - 1]}
                </Typography>
              </Box>
              <TextField
                autoFocus
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
              />
            </>
          )}
          {allTestsPassed && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Congratulations!
              </Typography>
              <Typography variant="body1">
                You have successfully completed all verification tests.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ position: 'relative', padding: 2 }}>
          <Button onClick={handleClose}>
            {allTestsPassed ? 'Close' : 'Cancel'}
          </Button>
          {!allTestsPassed && (
            <Button 
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