/* ─── DARK MODE ─── */
  function toggleDark() {
    document.body.classList.toggle('dark');
  }

  /* ─── NAVIGATION ─── */
  function showSection(id, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('section-' + id).classList.add('active');
    btn.classList.add('active');
  }

  /* ─── GPA CALCULATOR ─── */
  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  };

  function createCourseRow(index) {
    const row = document.createElement('div');
    row.className = 'course-row';
    row.id = 'row-' + index;
    row.innerHTML = `
      <input class="inp" type="text" placeholder="e.g. Mathematics" />
      <input class="inp" type="number" placeholder="Credits" min="0" max="6" step="0.5" />
      <select class="inp">
        ${Object.keys(gradePoints).map(g => `<option value="${g}">${g}</option>`).join('')}
      </select>
      <button class="remove-row" onclick="removeRow('row-${index}')">×</button>
    `;
    return row;
  }

  let rowIndex = 0;
  function addCourse() {
    document.getElementById('courseList').appendChild(createCourseRow(rowIndex++));
  }
  function removeRow(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
  function clearAll() {
    document.getElementById('courseList').innerHTML = '';
    document.getElementById('gpaResult').classList.remove('show');
    rowIndex = 0;
    addCourse(); addCourse(); addCourse();
  }

  function calculateGPA() {
    const rows = document.querySelectorAll('#courseList .course-row');
    let totalPoints = 0, totalCredits = 0;
    let valid = false;
    rows.forEach(row => {
      const credits = parseFloat(row.querySelectorAll('input')[1].value);
      const grade = row.querySelector('select').value;
      if (!isNaN(credits) && credits > 0 && grade) {
        totalPoints += gradePoints[grade] * credits;
        totalCredits += credits;
        valid = true;
      }
    });
    if (!valid || totalCredits === 0) { alert('Please enter at least one course with valid credits.'); return; }
    const gpa = totalPoints / totalCredits;
    document.getElementById('gpaNumber').textContent = gpa.toFixed(2);
    const letter = gpa >= 3.7 ? 'A' : gpa >= 3.3 ? 'A-' : gpa >= 3.0 ? 'B+' : gpa >= 2.7 ? 'B' : gpa >= 2.3 ? 'B-' : gpa >= 2.0 ? 'C' : gpa >= 1.0 ? 'D' : 'F';
    document.getElementById('gpaLetter').textContent = `Letter Grade: ${letter}`;
    document.getElementById('gpaResult').classList.add('show');
  }

  // Init with 3 rows
  addCourse(); addCourse(); addCourse();

  /* ─── STUDY TIMER (Countdown) ─── */
  let timerInterval = null;
  let secondsRemaining = 25 * 60; // 25 minutes countdown
  let running = false;
  let sessionsCompleted = 0;
  const CIRCUMFERENCE = 741.4;
  const SESSION_MAX = 25 * 60; // 25 min total

  function updateDisplay() {
    const m = Math.floor(secondsRemaining / 60).toString().padStart(2, '0');
    const s = (secondsRemaining % 60).toString().padStart(2, '0');
    document.getElementById('timerDisplay').textContent = `${m}:${s}`;

    // Ring empties as time counts down (full to empty)
    const pct = Math.max(secondsRemaining / SESSION_MAX, 0);
    const offset = CIRCUMFERENCE * (1 - pct);
    document.getElementById('ringProgress').style.strokeDashoffset = offset;

    // Turn urgent red when less than 1 minute
    const display = document.getElementById('timerDisplay');
    const ring = document.getElementById('ringProgress');
    if (secondsRemaining < 60 && secondsRemaining > 0) {
      display.classList.add('urgent');
      ring.classList.add('urgent');
    } else {
      display.classList.remove('urgent');
      ring.classList.remove('urgent');
    }
  }

  function startTimer() {
    if (running) return;
    running = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('timerStatus').textContent = 'Counting down...';
    document.getElementById('notifBanner').classList.remove('show');

    timerInterval = setInterval(() => {
      secondsRemaining--;
      updateDisplay();
      
      // When timer reaches 0
      if (secondsRemaining <= 0) {
        clearInterval(timerInterval); timerInterval = null; running = false;
        secondsRemaining = 0;
        updateDisplay();
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('timerStatus').textContent = 'Time\'s up!';
        document.getElementById('notifBanner').textContent = '🎉 Session complete! Great work!';
        document.getElementById('notifBanner').classList.add('show');
        
        // Play completion sound
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          [0, 0.25, 0.5].forEach(t => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 880; osc.type = 'sine';
            gain.gain.setValueAtTime(0.4, ctx.currentTime + t);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.6);
            osc.start(ctx.currentTime + t); osc.stop(ctx.currentTime + t + 0.65);
          });
        } catch(e) {}
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!running) return;
    clearInterval(timerInterval); timerInterval = null; running = false;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('timerStatus').textContent = 'Paused';
  }

  function resetTimer() {
    clearInterval(timerInterval); timerInterval = null; running = false;
    secondsRemaining = 25 * 60;
    updateDisplay();
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('timerStatus').textContent = 'Ready';
    document.getElementById('notifBanner').classList.remove('show');
    document.querySelectorAll('#sessionDots .dot').forEach(d => d.classList.remove('done'));
    sessionsCompleted = 0;
  }

  updateDisplay();

  /* ─── IDEA BOARD ─── */
  const IB_PALETTE = [
    {a:"#6d0f1b",b:"#4a0a12"},{a:"#2e7d32",b:"#1b5e20"},{a:"#1e6b3a",b:"#145229"},
    {a:"#1a5276",b:"#0e3152"},{a:"#7d3c98",b:"#5b2c6f"},{a:"#b03a2e",b:"#922b21"},
    {a:"#1a7a6e",b:"#12574e"},{a:"#d35400",b:"#a04000"},{a:"#2874a6",b:"#1a5276"},
    {a:"#6c3483",b:"#4a235a"},
  ];
  let ibMembers = ["Nimal","Sara","Alex","Priya","Jordan"];
  let ibColors = {};
  ibMembers.forEach((m,i) => ibColors[m] = IB_PALETTE[i % IB_PALETTE.length]);
  let ibIdeas = [
    {id:1, text:"Build a smart study planner app", author:"Nimal", time:"2 min ago", votes:4},
    {id:2, text:"Start a campus coding podcast", author:"Sara",  time:"5 min ago", votes:7},
    {id:3, text:"Organize a peer tutoring workshop", author:"Alex", time:"12 min ago", votes:2},
  ];
  let ibSelected="", ibVoted=new Set(), ibEditId=null, ibDropOpen=false, ibAddFormOpen=false;
  const ibInitials = n => n.slice(0,2).toUpperCase();
  const ibColor = a => ibColors[a] || IB_PALETTE[0];

  function ibToggleDrop() {
    ibDropOpen = !ibDropOpen;
    document.getElementById('ibDropMenu').classList.toggle('open', ibDropOpen);
    if (!ibDropOpen) ibCloseAddForm();
  }
  function ibCloseDrop() {
    ibDropOpen=false;
    document.getElementById('ibDropMenu').classList.remove('open');
    ibCloseAddForm();
  }
  document.addEventListener('mousedown', e => {
    const wrap = document.getElementById('ibDropWrap');
    if (wrap && !wrap.contains(e.target)) ibCloseDrop();
  });
  function ibSelectMember(name) {
    ibSelected=name;
    const c=ibColor(name);
    const btn=document.getElementById('ibDropBtn');
    btn.classList.add('selected');
    btn.innerHTML=`<span class="ib-btn-avatar" style="background:${c.a}">${ibInitials(name)}</span>${name}<span class="ib-drop-arrow">▾</span>`;
    ibCloseDrop(); ibRenderMembers(); ibUpdateBtn();
  }
  function ibRenderMembers() {
    document.getElementById('ibMemberList').innerHTML = ibMembers.map(name => {
      const c=ibColor(name);
      return `<button class="ib-drop-item" onclick="ibSelectMember('${name}')">
        <span class="ib-btn-avatar" style="background:${c.a}">${ibInitials(name)}</span>
        ${name}${ibSelected===name?'<span class="ib-check">✓</span>':''}
      </button>`;
    }).join('');
  }
  function ibToggleAddForm() {
    ibAddFormOpen=!ibAddFormOpen;
    document.getElementById('ibAddMemForm').classList.toggle('open', ibAddFormOpen);
    if (ibAddFormOpen) setTimeout(()=>document.getElementById('ibNewMemInput').focus(),50);
  }
  function ibCloseAddForm() {
    ibAddFormOpen=false;
    document.getElementById('ibAddMemForm').classList.remove('open');
    document.getElementById('ibNewMemInput').value='';
    ibClearMemErr();
  }
  function ibClearMemErr() { document.getElementById('ibMemError').style.display='none'; }
  function ibNewMemKey(e) { if(e.key==='Enter')ibAddMember(); if(e.key==='Escape')ibCloseAddForm(); }
  function ibAddMember() {
    const inp=document.getElementById('ibNewMemInput');
    const name=inp.value.trim();
    const err=document.getElementById('ibMemError');
    if (!name){err.textContent='Name cannot be empty.';err.style.display='block';return;}
    if (ibMembers.map(m=>m.toLowerCase()).includes(name.toLowerCase())){err.textContent='Member already exists!';err.style.display='block';return;}
    ibColors[name]=IB_PALETTE[ibMembers.length % IB_PALETTE.length];
    ibMembers.push(name);
    ibCloseAddForm(); ibCloseDrop(); ibSelectMember(name); ibRenderMembers();
  }
  function ibUpdateBtn() {
    const has=document.getElementById('ibIdeaInput').value.trim()!=='';
    document.getElementById('ibAddBtn').classList.toggle('active',!!(ibSelected&&has));
  }
  function ibIdeaKey(e) { if(e.key==='Enter')ibAddIdea(); }
  function ibAddIdea() {
    const inp=document.getElementById('ibIdeaInput');
    const text=inp.value.trim();
    if (!ibSelected||!text) return;
    const idea={id:Date.now(),text,author:ibSelected,time:'just now',votes:0};
    ibIdeas.unshift(idea);
    inp.value=''; ibUpdateBtn(); ibRender();
    setTimeout(()=>{
      const row=document.querySelector(`[data-ibid="${idea.id}"]`);
      if(row){row.classList.add('flash');setTimeout(()=>row.classList.remove('flash'),600);}
    },10);
  }
  function ibVote(id) {
    if(ibVoted.has(id))return;
    ibVoted.add(id);
    const idea=ibIdeas.find(i=>i.id===id);
    if(idea)idea.votes++;
    ibRender();
  }
  function ibDelete(id) {
    ibIdeas=ibIdeas.filter(i=>i.id!==id);
    if(ibEditId===id)ibEditId=null;
    ibRender();
  }
  function ibStartEdit(id) {
    ibEditId=id; ibRender();
    setTimeout(()=>{const el=document.querySelector(`.ib-edit-input[data-eid="${id}"]`);if(el)el.focus();},20);
  }
  function ibSaveEdit(id) {
    const el=document.querySelector(`.ib-edit-input[data-eid="${id}"]`);
    const text=el?el.value.trim():'';
    if(!text)return;
    const idea=ibIdeas.find(i=>i.id===id);
    if(idea)idea.text=text;
    ibEditId=null; ibRender();
  }
  function ibCancelEdit() { ibEditId=null; ibRender(); }
  function ibEditKey(e,id) { if(e.key==='Enter')ibSaveEdit(id); if(e.key==='Escape')ibCancelEdit(); }

  function ibRender() {
    const banner=document.getElementById('ibTopBar');
    if (ibIdeas.length>0) {
      const top=[...ibIdeas].sort((a,b)=>b.votes-a.votes)[0];
      banner.classList.remove('hidden');
      document.getElementById('ibTopText').textContent=`"${top.text}"`;
      document.getElementById('ibTopVotes').textContent=`· ${top.votes} votes`;
    } else { banner.classList.add('hidden'); }

    const list=document.getElementById('ibList');
    if (ibIdeas.length===0) {
      list.innerHTML=`<div class="ib-empty">No ideas yet — be the first to share one! 💡</div>`; return;
    }
    list.innerHTML=ibIdeas.map(idea=>{
      const c=ibColor(idea.author);
      const voted=ibVoted.has(idea.id);
      const editing=ibEditId===idea.id;
      const av=`background:linear-gradient(135deg,${c.a},${c.b})`;
      const content=editing
        ?`<div class="ib-edit-row">
            <input class="ib-edit-input" data-eid="${idea.id}" value="${idea.text.replace(/"/g,'&quot;')}"
              onkeydown="ibEditKey(event,${idea.id})" />
            <button class="ib-save-btn" onclick="ibSaveEdit(${idea.id})">Save</button>
            <button class="ib-cancel-btn" onclick="ibCancelEdit()">Cancel</button>
          </div>`
        :`<div class="ib-text">${idea.text}</div>
          <div class="ib-meta">
            <span class="ib-author" style="color:${c.a}">${idea.author}</span>
            &nbsp;·&nbsp;${idea.time}
          </div>`;
      const actions=editing?'':
        `<div class="ib-actions">
          <button class="ib-edit-btn" onclick="ibStartEdit(${idea.id})">✏️</button>
          <button class="ib-del-btn" onclick="ibDelete(${idea.id})">🗑️</button>
          <button class="ib-vote-btn ${voted?'voted':''}" onclick="ibVote(${idea.id})">
            <span class="ib-vote-arrow">${voted?'▲':'△'}</span>
            <span>${idea.votes}</span>
          </button>
        </div>`;
      return `<div class="ib-idea-row" data-ibid="${idea.id}">
        <div class="ib-avatar" style="${av}">${ibInitials(idea.author)}</div>
        <div class="ib-content">${content}</div>
        ${actions}
      </div>`;
    }).join('');
  }
  ibRenderMembers();
  ibRender();