require('dotenv').config();
// 其他引入语句，比如 const express = require('express'); 在这行下面
console.log('Token loaded:', process.env.SILICONFLOW_API_TOKEN ? 'Yes' : 'No');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});
app.use(bodyParser.json({ limit: '50mb' }));

// ---------- 根据队伍代码获取队伍信息 ----------
const getTeamInfo = (teamCode) => {
  const teams = {
    USA: { name: 'USA', primary: '#0A3161', accent: '#FFFFFF' },
    Mexico: { name: 'Mexico', primary: '#006847', accent: '#CE1126' },
    Argentina: { name: 'Argentina', primary: '#75AADB', accent: '#FCBF49' },
    Brazil: { name: 'Brazil', primary: '#FFD700', accent: '#009C3B' },
    France: { name: 'France', primary: '#0055A4', accent: '#EF4135' },
    England: { name: 'England', primary: '#FFFFFF', accent: '#C8102E' },
    Spain: { name: 'Spain', primary: '#C60B1E', accent: '#FFC400' },
    Germany: { name: 'Germany', primary: '#000000', accent: '#DD0000' },
    Portugal: { name: 'Portugal', primary: '#B50000', accent: '#006600' },
    Netherlands: { name: 'Netherlands', primary: '#FF6F00', accent: '#21468B' },
    Japan: { name: 'Japan', primary: '#000080', accent: '#FFFFFF' },
    Morocco: { name: 'Morocco', primary: '#C1272D', accent: '#006233' }
  };
  return teams[teamCode] || { name: teamCode, primary: '#1E3A8A', accent: '#FFFFFF' };
};



// ---------- 横幅背景生成 API ----------
module.exports = async (req, res) => {
  try {
    const { teamCode, motto, vibe } = req.body;
    
    const teamInfo = getTeamInfo(teamCode);
    const vibeDesc = vibe === 'neon' 
      ? 'neon lights, cyberpunk atmosphere, purple and blue glow' 
      : vibe === 'vintage' 
      ? 'vintage retro style, faded colors, classic football memorabilia aesthetic' 
      : 'epic stadium atmosphere, dramatic lighting, huge crowd, fireworks';
    
	const prompt = `A stunning World Cup 2026 social media banner background for ${teamInfo.name} national team fans, ${vibeDesc}, dynamic composition, confetti, trophy silhouette, flag elements, professional sports design, vivid colors, masterpiece, high quality, no text, no watermark`;

    const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_TOKEN;
    if (!SILICONFLOW_API_KEY) {
      return res.status(500).json({ error: 'Missing SILICONFLOW_API_TOKEN environment variable' });
    }

    const API_URL = 'https://api.siliconflow.cn/v1/images/generations';
    
    const requestBody = {
      model: 'Tongyi-MAI/Z-Image-Turbo',        
      prompt: prompt,
      num_images: 1,
      width: 1500,
      height: 500,
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
	if (!response.ok) {
  console.error('SiliconFlow 返回的错误详情：', JSON.stringify(data, null, 2));
}
    
    if (!response.ok) {
      console.error('SiliconFlow API Error:', data);
      throw new Error(data.error?.message || 'SiliconFlow API request failed');
    }

    const imageUrl = data.images[0].url;
    const imgResponse = await fetch(imageUrl);
    const buffer = await imgResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    
    res.json({ success: true, imageData: dataUrl });
  } catch (error) {
    console.error('Banner generation error:', error);
    res.status(500).json({ error: 'Failed to generate banner background', details: error.message });
  }
};

// ---------- 健康检查 ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Make sure SILICONFLOW_API_TOKEN is set in environment variables`);
});