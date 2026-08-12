/**
 * 公共工具 - 部署版
 * 接口地址使用相对路径 /api，前后端同域名部署
 */

const API_BASE = '/api';  // 相对路径，自动跟随当前域名和端口
const WS_BASE = 'ws://' + window.location.host + '/api';  // WebSocket地址

// 工具函数
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

// 格式化时间
function formatTime(date) {
  const d = new Date(date);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return h + ':' + m;
}

// 本地存储
const storage = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  remove(k) { localStorage.removeItem(k); }
};

// ==================== API 请求 ====================

async function apiPost(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('API Error: ' + res.status);
  return res.json();
}

// SSE 流式请求
async function apiStream(path, body, onChunk, onDone) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop();
    for (const line of lines) {
      const match = line.match(/^event: (\w+)\ndata: (.+)$/m);
      if (!match) continue;
      const [, event, data] = match;
      const payload = JSON.parse(data);
      if (event === 'token' && onChunk) onChunk(payload.chunk);
      if (event === 'done' && onDone) onDone(payload);
    }
  }
}

// TTS 语音合成
async function apiTTS(text) {
  const res = await fetch(API_BASE + '/voice/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('TTS failed');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// WebSocket ASR
function createASRConnection(onResult, onError) {
  const ws = new WebSocket(WS_BASE + '/voice/ws/asr');
  ws.onopen = () => console.log('ASR WebSocket connected');
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === 'result' && onResult) {
      onResult(data.data.payload.result);
    }
  };
  ws.onerror = (e) => onError && onError(e);
  return ws;
}

// 导出
window.$ = $; window.$$ = $$; window.storage = storage;
window.apiPost = apiPost; window.apiStream = apiStream;
window.apiTTS = apiTTS; window.createASRConnection = createASRConnection;
window.formatTime = formatTime;
