/**
 * 模拟面试对话页 - 部署版
 * 调用 next / answer / stop / tts / asr 接口
 */
(function() {
  let session = { id: null, jobTitle: '', status: 'interviewing', phase: 'technical', messages: [], isInterviewing: false, isRecording: false, isStreaming: false, ttsEnabled: true, mode: 'voice', asrWs: null, currentAudio: null };
  const PHASE_MAP = { technical: { name: '技术面试', order: 0 }, behavioral: { name: '综合面试', order: 1 }, closing: { name: '收尾环节', order: 2 } };
  const PHASE_LIST = ['technical', 'behavioral', 'closing'];

  function init() {
    const saved = storage.get('currentInterview');
    if (!saved) { location.href = 'interview.html'; return; }
    session.id = saved.sessionId;
    session.jobTitle = saved.jobTitle || '';
    session.ttsEnabled = saved.tts !== undefined ? saved.tts : true;
    session.mode = saved.mode || 'voice';
    session.isInterviewing = true;
    renderHeader();
    renderPhaseProgress();
    renderMessages();
    bindEvents();
    if (saved.openingReply) addMessage('interviewer', saved.openingReply, { isOpening: true });
    // 获取第一题
    fetchNextQuestion();
  }

  function renderHeader() {
    const header = $('#chatHeader');
    if (!header) return;
    const phaseNames = { technical: '技术面试', behavioral: '综合面试', closing: '收尾环节' };
    const h1 = header.querySelector('h1');
    if (h1) h1.textContent = phaseNames[session.phase] || '模拟面试';
    const sessionEl = $('#sessionId');
    if (sessionEl && session.id) { sessionEl.textContent = session.id.slice(0, 8) + '...'; sessionEl.title = session.id; }
  }

  function renderPhaseProgress() {
    const container = $('#phaseProgress');
    if (!container) return;
    const currentOrder = PHASE_MAP[session.phase]?.order || 0;
    let html = '<div class="phase-progress-label">阶段进度</div><div class="phase-steps">';
    PHASE_LIST.forEach((phase, index) => {
      const info = PHASE_MAP[phase];
      const isActive = phase === session.phase;
      const isCompleted = index < currentOrder;
      html += `<div class="phase-step"><div class="phase-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}"></div><span class="phase-name ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">${info.name}</span></div>`;
      if (index < PHASE_LIST.length - 1) html += `<div class="phase-line ${isCompleted ? 'completed' : ''}"></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function renderMessages() {
    const container = $('#chatMessages');
    if (!container) return;
    if (session.messages.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">&#127908;</div><p>面试即将开始，请做好准备</p></div>';
      return;
    }
    container.innerHTML = session.messages.map(msg => renderMessageHTML(msg)).join('');
    scrollToBottom();
  }

  function renderMessageHTML(msg) {
    const isInterviewer = msg.role === 'interviewer';
    const avatar = isInterviewer ? '&#128100;' : '&#128578;';
    const avatarClass = isInterviewer ? 'interviewer' : 'user';
    let tagHtml = '';
    if (isInterviewer && msg.decision) {
      const tagClass = msg.decision === 'follow_up' ? 'follow-up' : 'next';
      const tagText = msg.decision === 'follow_up' ? '追问' : '下一题';
      tagHtml = `<span class="message-tag ${tagClass}">${tagText}</span>`;
    }
    let actionsHtml = '';
    if (isInterviewer && session.ttsEnabled) {
      actionsHtml = `<div class="message-actions"><button class="btn-play-voice" data-msg-id="${msg.id}" title="播放语音">&#128266; 播放语音</button></div>`;
    }
    return `<div class="message ${msg.role}" data-id="${msg.id}"><div class="message-avatar ${avatarClass}">${avatar}</div><div class="message-content"><div class="message-header"><span class="message-role">${isInterviewer ? '面试官' : '我'}</span>${tagHtml}</div><div class="message-bubble">${escapeHtml(msg.content)}</div>${actionsHtml}<div class="message-time">${msg.time}</div></div></div>`;
  }

  function addMessage(role, content, extra) {
    extra = extra || {};
    const msg = { id: Date.now(), role: role, content: content, time: formatTime(new Date()), decision: extra.decision || null, score: extra.score || null, feedback: extra.feedback || null, isOpening: extra.isOpening || false };
    session.messages.push(msg);
    const container = $('#chatMessages');
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    const div = document.createElement('div');
    div.innerHTML = renderMessageHTML(msg);
    container.appendChild(div.firstElementChild);
    scrollToBottom();
    if (role === 'interviewer' && session.ttsEnabled && !extra.isOpening) playTTS(content, msg.id);
    return msg;
  }

  function addScoreCard(score, feedback) {
    const container = $('#chatMessages');
    const div = document.createElement('div');
    div.innerHTML = `<div class="score-card" style="animation: fadeInUp 0.4s ease;"><div class="score-card-header"><span class="score-card-title">&#128202; 本轮评分</span><span class="score-card-value">${score}分</span></div><div class="score-card-feedback">${escapeHtml(feedback)}</div></div>`;
    container.appendChild(div.firstElementChild);
    scrollToBottom();
  }

  function showTyping() {
    const container = $('#chatMessages');
    const div = document.createElement('div');
    div.className = 'typing-row'; div.id = 'typingIndicator';
    div.innerHTML = '<div class="message interviewer"><div class="message-avatar interviewer">&#128100;</div><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
    container.appendChild(div);
    scrollToBottom();
  }

  function hideTyping() { const el = $('#typingIndicator'); if (el) el.remove(); }
  function scrollToBottom() { const c = $('#chatMessages'); if (c) c.scrollTop = c.scrollHeight; }

  async function playTTS(text, msgId) {
    try {
      const btn = document.querySelector(`.btn-play-voice[data-msg-id="${msgId}"]`);
      if (btn) btn.classList.add('playing');
      const audioUrl = await apiTTS(text);
      if (audioUrl) {
        session.currentAudio = new Audio(audioUrl);
        session.currentAudio.onended = () => { if (btn) btn.classList.remove('playing'); };
        await session.currentAudio.play();
      }
    } catch (err) {
      console.error('TTS 播放失败:', err);
      const btn = document.querySelector(`.btn-play-voice[data-msg-id="${msgId}"]`);
      if (btn) btn.classList.remove('playing');
    }
  }

  async function fetchNextQuestion() {
    if (!session.id) return;
    showTyping();
    try {
      const data = await apiPost('/interview/next', { session_id: session.id });
      hideTyping();
      handleQuestionResponse(data);
    } catch (err) {
      console.error('获取题目失败:', err);
      hideTyping();
      addMessage('interviewer', '抱歉，获取题目失败，请刷新页面重试。');
    }
  }

  function handleQuestionResponse(data) {
    if (data.phase) { session.phase = data.phase; renderHeader(); renderPhaseProgress(); }
    if (data.question) addMessage('interviewer', data.question, { decision: data.decision });
    if (data.status === 'summarizing') session.status = 'summarizing';
  }

  async function submitAnswer(answerText) {
    if (!session.id || !answerText.trim()) return;
    addMessage('user', answerText);
    showTyping();
    try {
      const data = await apiPost('/interview/answer', { session_id: session.id, answer: answerText });
      hideTyping();
      handleAnswerResponse(data);
    } catch (err) {
      console.error('提交回答失败:', err);
      hideTyping();
      addMessage('interviewer', '抱歉，提交失败，请重试。');
    }
  }

  function handleAnswerResponse(data) {
    if (data.score !== undefined && data.feedback) addScoreCard(data.score, data.feedback);
    if (data.phase) { session.phase = data.phase; renderHeader(); renderPhaseProgress(); }
    if (data.question) addMessage('interviewer', data.question, { decision: data.decision });
    if (data.status === 'summarizing') session.status = 'summarizing';
  }

  function toggleRecording() {
    if (session.isRecording) stopRecording();
    else startRecording();
  }

  function startRecording() {
    const micBtn = $('#btnMic');
    session.isRecording = true;
    micBtn.classList.add('recording');
    showVoiceStatus('正在录音，请说话...');
    try {
      session.asrWs = createASRConnection(
        (text) => { /* 实时识别结果可在这里显示 */ console.log('[ASR]', text); },
        (err) => { console.error('ASR Error:', err); stopRecording(); }
      );
    } catch (err) {
      console.error('ASR 连接失败:', err);
      stopRecording();
    }
  }

  function stopRecording() {
    const micBtn = $('#btnMic');
    micBtn.classList.remove('recording');
    session.isRecording = false;
    if (session.asrWs) {
      try { session.asrWs.send('finish'); session.asrWs.close(); } catch(e) {}
      session.asrWs = null;
    }
  }

  function showVoiceStatus(text) {
    const container = $('#chatMessages');
    const old = container.querySelector('.voice-status-row');
    if (old) old.remove();
    const div = document.createElement('div');
    div.className = 'voice-status-row';
    div.innerHTML = `<div class="voice-status-bar"><div class="voice-wave"><span></span><span></span><span></span><span></span><span></span></div><span>${text}</span></div>`;
    container.appendChild(div);
    scrollToBottom();
    setTimeout(() => div.remove(), 3000);
  }

  function toggleTextInput() {
    const wrapper = $('#textInputWrapper');
    const hint = $('#inputHint');
    const controls = $('.input-controls');
    wrapper.classList.toggle('active');
    if (wrapper.classList.contains('active')) {
      hint.style.display = 'none';
      controls.style.display = 'none';
      $('#textInput').focus();
    } else {
      hint.style.display = 'block';
      controls.style.display = 'flex';
    }
  }

  function sendTextMessage() {
    const input = $('#textInput');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    submitAnswer(text);
  }

  async function endInterview() {
    if (!confirm('确定要结束本次面试吗？结束后将生成面试总结。')) return;
    session.isInterviewing = false;
    addMessage('interviewer', '面试到此结束，感谢你的参与！正在为你生成面试总结...');
    try {
      const data = await apiPost('/interview/stop', { session_id: session.id });
      showSummaryModal(data);
    } catch (err) {
      console.error('获取总结失败:', err);
      alert('生成总结失败: ' + err.message);
    }
  }

  function showSummaryModal(data) {
    const existing = document.querySelector('.summary-modal-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'summary-modal-overlay';
    const score = data.overall_score || 0;
    overlay.innerHTML = `<div class="summary-modal"><div class="summary-modal-header"><h2>面试总结</h2><button class="btn-modal-close">&times;</button></div><div class="summary-modal-body"><div class="summary-score-section"><div class="score-circle" style="--score: ${score};"><div class="score-circle-inner"><span class="score-num">${score}</span><span class="score-label">综合评分</span></div></div></div>${data.summary_text ? `<div class="summary-section"><div class="summary-text">${escapeHtml(data.summary_text)}</div></div>` : ''}<div class="summary-section"><div class="summary-section-title"><span class="icon strength">&#10003;</span>优势</div><ul class="summary-list">${(data.strengths || []).map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul></div><div class="summary-section"><div class="summary-section-title"><span class="icon weakness">!</span>待提升</div><ul class="summary-list">${(data.weaknesses || []).map(w => `<li>${escapeHtml(w)}</li>`).join('')}</ul></div><div class="summary-section"><div class="summary-section-title"><span class="icon improvement">&#8594;</span>改进建议</div><ul class="summary-list">${(data.improvements || []).map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>${data.score_details && data.score_details.length > 0 ? `<div class="score-details">${data.score_details.map(d => `<div class="score-detail-item"><div class="score-detail-label">${escapeHtml(d.label)}</div><div class="score-detail-value">${d.value}</div></div>`).join('')}</div>` : ''}</div><div class="summary-modal-footer"><button class="btn-summary-action secondary" id="btnViewDetail">查看详细评分</button><button class="btn-summary-action primary" id="btnBackHome">返回首页</button></div></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.btn-modal-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#btnBackHome').addEventListener('click', () => {
      const records = storage.get('interviewHistory') || [];
      records.unshift({ id: Date.now(), title: `${session.jobTitle} - 面试`, date: new Date().toISOString().split('T')[0], duration: '20分钟', score: data.overall_score, phase: session.phase, sessionId: session.id });
      storage.set('interviewHistory', records);
      storage.remove('currentInterview');
      location.href = 'interview.html';
    });
    overlay.querySelector('#btnViewDetail').addEventListener('click', () => alert('详细评分功能开发中...'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  function bindEvents() {
    $('#btnEndInterview')?.addEventListener('click', endInterview);
    $('#btnMic')?.addEventListener('click', toggleRecording);
    $('#btnVoice')?.addEventListener('click', toggleTextInput);
    $('#btnSend')?.addEventListener('click', sendTextMessage);
    $('#textInput')?.addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTextMessage(); } });
    document.addEventListener('click', function(e) {
      const playBtn = e.target.closest('.btn-play-voice');
      if (playBtn) { const msgId = playBtn.dataset.msgId; const msg = session.messages.find(m => m.id == msgId); if (msg) playTTS(msg.content, msgId); }
    });
  }

  function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
