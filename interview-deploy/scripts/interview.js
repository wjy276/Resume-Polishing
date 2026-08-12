/**
 * 模拟面试首页 - 部署版
 * 调用 POST /api/interview/start
 */
(function() {
  const hotJobs = ['前端开发工程师', '后端开发工程师', '算法工程师', '产品经理', '全栈工程师', '数据分析师'];
  let state = { jobTitle: '', interviewMode: 'voice', ttsEnabled: true, isStarting: false };

  function init() {
    renderHotJobs();
    renderHistory();
    bindEvents();
    loadConfig();
  }

  function renderHotJobs() {
    const container = $('#hotJobs');
    if (!container) return;
    container.innerHTML = hotJobs.map(j =>
      `<span class="tag" data-job="${j}">${j}</span>`
    ).join('');
  }

  function renderHistory() {
    const records = storage.get('interviewHistory') || [];
    const container = $('#historyList');
    if (!container) return;
    if (records.length === 0) {
      container.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:40px;">暂无面试记录</div>';
      return;
    }
    container.innerHTML = records.map(r => {
      const scoreClass = r.score >= 85 ? 'high' : r.score >= 70 ? 'mid' : 'low';
      const phaseMap = { technical: '技术面试', behavioral: '综合面试', closing: '收尾环节' };
      return `<div class="history-item" data-session="${r.sessionId || ''}">
        <div class="history-item-left">
          <div class="history-icon">&#128172;</div>
          <div class="history-info">
            <h4>${escapeHtml(r.title)}</h4>
            <div class="history-meta">${r.date} · ${r.duration}</div>
            ${r.phase ? `<div class="history-phase">${phaseMap[r.phase] || '面试'}</div>` : ''}
          </div>
        </div>
        <div class="history-right">
          <div class="history-score"><div class="score-value ${scoreClass}">${r.score}</div><div class="score-label">综合评分</div></div>
          <button class="btn-detail">查看详情</button>
        </div>
      </div>`;
    }).join('');
  }

  function loadConfig() {
    const saved = storage.get('interviewConfig');
    if (saved) {
      state.interviewMode = saved.mode || 'voice';
      state.ttsEnabled = saved.tts !== undefined ? saved.tts : true;
      updateConfigUI();
    }
  }

  function updateConfigUI() {
    $$('[data-mode]').forEach(el => el.classList.toggle('active', el.dataset.mode === state.interviewMode));
    $$('[data-tts]').forEach(el => el.classList.toggle('active', (el.dataset.tts === 'true') === state.ttsEnabled));
  }

  function saveConfig() {
    storage.set('interviewConfig', { mode: state.interviewMode, tts: state.ttsEnabled });
  }

  async function startInterview() {
    const jobInput = $('#jobInput');
    state.jobTitle = jobInput.value.trim();
    if (!state.jobTitle) { alert('请输入目标岗位'); jobInput.focus(); return; }
    if (state.isStarting) return;
    state.isStarting = true;

    const btn = $('#btnStartInterview');
    btn.disabled = true;
    btn.innerHTML = '<span style="width:16px;height:16px;border:2px solid #e5e7eb;border-top-color:#3b82f6;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block;"></span> 准备中...';

    try {
      const data = await apiPost('/interview/start', {
        job_title: state.jobTitle,
        session_id: null,
      });

      storage.set('currentInterview', {
        sessionId: data.session_id,
        jobTitle: state.jobTitle,
        normalizedTitle: data.job_title_normalized,
        status: data.status,
        openingReply: data.reply,
        mode: state.interviewMode,
        tts: state.ttsEnabled,
        startTime: Date.now(),
      });
      saveConfig();
      location.href = 'interview-chat.html';
    } catch (err) {
      console.error('开始面试失败:', err);
      alert('开始面试失败: ' + err.message);
      state.isStarting = false;
      btn.disabled = false;
      btn.innerHTML = '<span>&#128222;</span><span>开始面试</span>';
    }
  }

  function bindEvents() {
    document.addEventListener('click', function(e) {
      const tag = e.target.closest('#hotJobs .tag');
      if (tag) { $('#jobInput').value = tag.dataset.job; state.jobTitle = tag.dataset.job; }
    });

    $('#jobInput')?.addEventListener('input', function(e) {
      state.jobTitle = e.target.value.trim();
    });

    document.addEventListener('click', function(e) {
      const modeItem = e.target.closest('[data-mode]');
      if (modeItem) { state.interviewMode = modeItem.dataset.mode; updateConfigUI(); }
      const ttsItem = e.target.closest('[data-tts]');
      if (ttsItem) { state.ttsEnabled = ttsItem.dataset.tts === 'true'; updateConfigUI(); }
    });

    $('#btnStartInterview')?.addEventListener('click', startInterview);

    $('#searchInput')?.addEventListener('input', function(e) {
      const keyword = e.target.value.trim().toLowerCase();
      const records = storage.get('interviewHistory') || [];
      const filtered = keyword ? records.filter(r => r.title.toLowerCase().includes(keyword)) : records;
      // 重新渲染过滤结果（简化版）
      const container = $('#historyList');
      if (!container) return;
      if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:40px;">暂无匹配记录</div>';
        return;
      }
      container.innerHTML = filtered.map(r => {
        const scoreClass = r.score >= 85 ? 'high' : r.score >= 70 ? 'mid' : 'low';
        return `<div class="history-item"><div class="history-item-left"><div class="history-icon">&#128172;</div><div class="history-info"><h4>${escapeHtml(r.title)}</h4><div class="history-meta">${r.date}</div></div></div><div class="history-right"><div class="history-score"><div class="score-value ${scoreClass}">${r.score}</div></div></div></div>`;
      }).join('');
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
