import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import axios from 'axios';

const SAMPLE_CONTENT = `亲爱的用户，欢迎您使用DeepSeek产品及服务！ 1.DeepSeek产品及服务由杭州深度求索人工智能基础技术研究有限公司、北京深度求索人工智能基础技术研究有限公司及其关联公司（以下简称"我们"或"深度求索"）共同所有和负责运营。在使用本服务前，请您务必仔细阅读并理解本《DeepSeek用户协议》（以下简称"本协议"）以及本平台的其他相关协议、政策或指引。2.您在使用本服务某一特定功能时，针对该特定功能可能会另有单独的协议、相关业务规则等（以下简称"具体协议"）。本协议与具体协议的内容存在冲突的，以具体协议的规定为准。所有前述条款和规则构成本协议不可分割的组成部分（以上通称"全部协议"），与本协议正文具有同等法律效力。 3.其中，《DeepSeek开放平台服务协议》作为一项具体协议及本协议的组成部分，特别适用于您使用本平台提供的应用程序编程接口（API）或其他开发者工具等开放平台服务。 4.关于我们如何收集、保护和使用个人信息的具体规则，请您仔细阅读《DeepSeek 隐私政策》。 5.我们特别提醒您在使用本服务之前认真阅读（未满18周岁的未成年人应在法定监护人陪同下阅读）、充分理解以上协议的全部条款，尤其是加粗显示的条款。当您通过网络页面点击确认、勾选等方式同意本协议或实际使用本服务时，均表示您与我们已就全部协议达成一致，6.您已接受所述的所有条款及其适用条件，同意受全部协议约束。如果您不同意全部协议的任一内容，或者无法准确理解我方对全部协议条款的解释，请点击不同意或停止使用本服务。`;

const ThemeInput = ({ onThemeGenerated }) => {
  const [theme, setTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleThemeSubmit = async () => {
    if (!theme || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post('http://server.tsxc.xyz:8000/api/questions', null, {
        params: {
          message_request: theme,
          message_content: SAMPLE_CONTENT,
          session_id: 1
        }
      });
      
      if (response.data) {
        await onThemeGenerated(response.data);
      }
    } catch (error) {
      console.error('Error generating theme content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body1" gutterBottom>
        Please enter a theme of terms you would like to read to begin the test:
      </Typography>
      <TextField
        fullWidth
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        variant="outlined"
        size="small"
        sx={{ mb: 2 }}
        disabled={isLoading}
      />
      <Button
        variant="contained"
        onClick={handleThemeSubmit}
        disabled={!theme || isLoading}
        sx={{ width: '100%', mb: 2 }}
      >
        {isLoading ? 'Loading... (Please be patient)' : 'Set Theme'}
      </Button>
    </Box>
  );
};

export default ThemeInput; 