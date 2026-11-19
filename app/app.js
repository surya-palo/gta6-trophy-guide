// Leonida Trophy Guide — offline trophy tracker for GTA VI (PS5).
// Loads app/data/trophies.json, keeps progress in localStorage, and renders the
// checklist, roadmap, missables and save views. No network access anywhere.
(function () {
  'use strict';

  var KEY = 'leonida-trophy-guide-v1';
  var POINTS = { bronze: 15, silver: 30, gold: 90, platinum: 300 };
  var KIND_LABELS = {
    story: 'Story', collectibles: 'Collectibles', activities: 'Activities',
    missable: 'Missable', platinum: 'Platinum'
  };
  var STAGES = [
    { n: 1, title: 'Story first — and the one missable', blurb: 'Play the story (60–80 hours, 5 chapters). All 12 story trophies unlock automatically as you go — the chapter trophies pop a mission or two after their chapter starts. Do the Chapter 1 meditation the moment Lucia offers it: it is the only thing in the game that can be missed.' },
    { n: 2, title: 'Activities & stranger strands', blurb: 'After the story, work the activities: shooting ranges, races, drone races, stunts, the stranger questlines (Andy, Kenton, Billy, Randy, Tyrone, Bret, Cal) and the counted challenges. Most of these overlap with the 100% checklist.' },
    { n: 3, title: 'Collectibles sweep', blurb: 'WAiNK scans, vehicle scans, garages, card sets, meditation spots and full map exploration. Fly the state by plane for the map, and scan everything you pass.' },
    { n: 4, title: 'Robberies & cleanup', blurb: 'Bank vaults, armored trucks, gang operations, jewelry jobs and the money trophies. Bring your partner, bring sticky bombs, and launder the marked bills.' },
    { n: 5, title: '100% completion — A Long Road', blurb: 'The 35-task 100% checklist opens after the story. Finish whatever is left of it — optional missions, vehicle and animal counts, challenges, stunts — and the gold trophy A Long Road unlocks, then the platinum.' }
  ];

  var trophies = [];
  var byId = {};
  var state = load();
  var selectedId = null;
  var revealed = {}; // spoiler reveals, session-only

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return { earned: {}, counts: {}, notes: {}, spoiler: false };
      var s = JSON.parse(raw);
      return {
        earned: s.earned || {}, counts: s.counts || {},
        notes: s.notes || {}, spoiler: !!s.spoiler
      };
    } catch (e) {
      return { earned: {}, counts: {}, notes: {}, spoiler: false };
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full/blocked */ }
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function isEarned(t) { return !!state.earned[t.id]; }
  function countOf(t) { return Math.max(0, Math.min(t.count || 0, Number(state.counts[t.id]) || 0)); }
  function isSpoiled(t) {
    return state.spoiler && t.kind === 'story' && t.hidden && !isEarned(t) && !revealed[t.id];
  }

  function earnedCount() { return trophies.filter(isEarned).length; }
  function points() {
    return trophies.reduce(function (sum, t) {
      return sum + (isEarned(t) ? POINTS[t.grade] : 0);
    }, 0);
  }

  function toggleEarned(t, on) {
    if (on) state.earned[t.id] = true; else delete state.earned[t.id];
    save();
    renderAll();
  }

  // ---------- stats header ----------
  function renderStats() {
    var n = earnedCount();
    var total = trophies.length || 55;
    document.getElementById('stat-earned').textContent = n + '/' + total;
    document.getElementById('stat-points').textContent = points();
    var pct = Math.round((n / total) * 100);
    document.getElementById('stat-pct').textContent = pct + '%';
    var bar = document.getElementById('stat-bar');
    bar.style.width = pct + '%';
    document.getElementById('stat-bar-wrap').setAttribute('aria-valuenow', String(n));
  }

  // ---------- next-up planner ----------
  function nextUp() {
    var remaining = trophies.filter(function (t) { return !isEarned(t) && t.grade !== 'platinum'; });
    remaining.sort(function (a, b) {
      if (a.missable !== b.missable) return a.missable ? -1 : 1;
      if (a.roadmap !== b.roadmap) return a.roadmap - b.roadmap;
      return a.id - b.id;
    });
    return remaining.slice(0, 3);
  }

  function renderNextUp() {
    var box = document.getElementById('nextup');
    box.replaceChildren();
    var picks = nextUp();
    if (!picks.length) {
      box.append(el('strong', null, 'Platinum earned — every trophy is ticked. Nice work, Leonida legend.'));
      return;
    }
    var label = el('span', 'nextup-label', 'Next up: ');
    box.append(label);
    picks.forEach(function (t, i) {
      if (i) box.append(document.createTextNode('  ·  '));
      var a = el('a', 'nextup-link', isSpoiled(t) ? 'Hidden story trophy' : t.name);
      a.href = '#/trophy/' + t.id;
      if (t.missable) a.classList.add('missable');
      box.append(a);
    });
    var hint = el('span', 'nextup-hint', ' — ordered by the roadmap: the missable first, then story, then activities, collectibles and cleanup.');
    box.append(hint);
  }

  // ---------- checklist ----------
  function filtered() {
    var q = (document.getElementById('q').value || '').toLowerCase().trim();
    var kind = document.getElementById('f-kind').value;
    var grade = document.getElementById('f-grade').value;
    var status = document.getElementById('f-status').value;
    return trophies.filter(function (t) {
      if (kind && t.kind !== kind) return false;
      if (grade && t.grade !== grade) return false;
      if (status === 'earned' && !isEarned(t)) return false;
      if (status === 'remaining' && isEarned(t)) return false;
      if (q) {
        var hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function gradeMark(grade) {
    var m = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
    return el('span', 'grade-mark grade-' + grade, m[grade] || '?');
  }

  function renderList() {
    var list = document.getElementById('trophy-list');
    list.replaceChildren();
    var rows = filtered();
    document.getElementById('list-meta').textContent =
      'Showing ' + rows.length + ' of ' + trophies.length + ' trophies · ' +
      earnedCount() + ' earned';
    rows.forEach(function (t) {
      var li = el('li', 'trophy-row' + (isEarned(t) ? ' earned' : '') + (selectedId === t.id ? ' selected' : ''));
      li.id = 'trophy-' + t.id;

      var box = el('input', 'earn-box');
      box.type = 'checkbox';
      box.checked = isEarned(t);
      box.setAttribute('aria-label', 'Earned: ' + t.name);
      box.addEventListener('change', function () { toggleEarned(t, box.checked); });
      li.append(box);
      li.append(gradeMark(t.grade));

      var body = el('div', 'trophy-body');
      var name = el('span', 'trophy-name', isSpoiled(t) ? 'Hidden story trophy' : t.name);
      body.append(name);
      var desc = el('span', 'trophy-desc', isSpoiled(t) ? 'Unlocks during the story — hidden while spoilers are on.' : t.description);
      body.append(desc);
      var meta = el('span', 'trophy-meta');
      meta.append(el('span', 'kind', KIND_LABELS[t.kind] || t.kind));
      if (t.hidden && !isSpoiled(t)) meta.append(el('span', 'tag', 'Hidden'));
      if (t.missable) meta.append(el('span', 'tag tag-missable', 'MISSABLE'));
      if (t.count) {
        var c = countOf(t);
        meta.append(el('span', 'tag tag-count', c + ' / ' + t.count + ' ' + (t.countLabel || '')));
      }
      body.append(meta);
      li.append(body);

      li.addEventListener('click', function (e) {
        if (e.target === box) return;
        location.hash = '#/trophy/' + t.id;
      });
      list.append(li);
    });
    if (!rows.length) {
      var none = el('li', 'trophy-none', 'No trophies match these filters.');
      list.append(none);
    }
  }

  // ---------- detail pane ----------
  function renderDetail() {
    var pane = document.getElementById('detail');
    pane.replaceChildren();
    var t = byId[selectedId];
    if (!t) {
      pane.append(el('p', 'detail-empty', 'Select a trophy to read its full guide, sources and progress counter.'));
      return;
    }
    var head = el('div', 'detail-head');
    head.append(gradeMark(t.grade));
    head.append(el('h2', 'detail-name', isSpoiled(t) ? 'Hidden story trophy' : t.name));
    pane.append(head);
    pane.append(el('p', 'detail-desc', isSpoiled(t) ? 'This story trophy is hidden while spoilers are on.' : t.description));

    var tags = el('p', 'detail-tags');
    tags.append(el('span', 'kind', KIND_LABELS[t.kind] || t.kind));
    tags.append(el('span', 'tag', t.grade.charAt(0).toUpperCase() + t.grade.slice(1) + ' · ' + POINTS[t.grade] + ' pts'));
    if (t.hidden) tags.append(el('span', 'tag', 'Hidden trophy'));
    if (t.missable) tags.append(el('span', 'tag tag-missable', 'MISSABLE — do it in Chapter 1'));
    pane.append(tags);

    if (isSpoiled(t)) {
      var warn = el('p', 'spoiler-warn', 'The guide for this story trophy names chapters and missions. It is hidden until you earn it — or until you choose to see it.');
      pane.append(warn);
      var reveal = el('button', 'btn', 'Show the guide anyway');
      reveal.type = 'button';
      reveal.addEventListener('click', function () { revealed[t.id] = true; renderAll(); });
      pane.append(reveal);
    } else {
      pane.append(el('h3', null, 'How to get it'));
      pane.append(el('p', 'detail-guide', t.guide));
    }

    if (t.count) {
      var c = countOf(t);
      var wrap = el('div', 'counter');
      wrap.append(el('label', null, 'Your progress: '));
      var input = el('input', 'counter-input');
      input.type = 'number';
      input.min = '0';
      input.max = String(t.count);
      input.value = String(c);
      input.setAttribute('aria-label', 'Progress for ' + t.name + ', out of ' + t.count + ' ' + (t.countLabel || ''));
      input.addEventListener('change', function () {
        var v = Math.max(0, Math.min(t.count, Number(input.value) || 0));
        state.counts[t.id] = v;
        if (v >= t.count) state.earned[t.id] = true;
        save();
        renderAll();
      });
      wrap.append(input);
      wrap.append(document.createTextNode(' / ' + t.count + ' ' + (t.countLabel || '')));
      var bar = el('div', 'mini-progress');
      var fill = el('div', 'mini-fill');
      fill.style.width = Math.round((c / t.count) * 100) + '%';
      bar.append(fill);
      wrap.append(bar);
      pane.append(wrap);
    }

    var earn = el('label', 'earn-toggle');
    var cb = el('input');
    cb.type = 'checkbox';
    cb.checked = isEarned(t);
    cb.addEventListener('change', function () { toggleEarned(t, cb.checked); });
    earn.append(cb);
    earn.append(document.createTextNode(' I earned this trophy'));
    pane.append(earn);

    var noteLabel = el('label', 'note-label', 'Your notes');
    var note = el('textarea', 'note-input');
    note.rows = 3;
    note.placeholder = 'e.g. “3 ranges left, start at Vice Beach”';
    note.value = state.notes[t.id] || '';
    note.addEventListener('input', function () {
      state.notes[t.id] = note.value;
      save();
    });
    pane.append(noteLabel);
    pane.append(note);

    if (t.sources && t.sources.length && !isSpoiled(t)) {
      pane.append(el('h3', null, 'Sources'));
      var ul = el('ul', 'sources');
      t.sources.forEach(function (s) {
        var li = el('li');
        var a = el('a', null, s.name);
        a.href = s.url;
        a.target = '_blank';
        a.rel = 'noopener';
        li.append(a);
        ul.append(li);
      });
      pane.append(ul);
    }
  }

  // ---------- roadmap ----------
  function renderRoadmap() {
    var box = document.getElementById('roadmap-stages');
    box.replaceChildren();
    STAGES.forEach(function (stage) {
      var members = trophies.filter(function (t) { return t.roadmap === stage.n; });
      var done = members.filter(isEarned).length;
      var card = el('article', 'stage');
      var h = el('h3', null, 'Stage ' + stage.n + ' — ' + stage.title);
      card.append(h);
      card.append(el('p', 'stage-blurb', stage.blurb));
      var prog = el('p', 'stage-prog', done + ' of ' + members.length + ' earned');
      card.append(prog);
      var bar = el('div', 'mini-progress');
      var fill = el('div', 'mini-fill');
      fill.style.width = (members.length ? Math.round((done / members.length) * 100) : 0) + '%';
      bar.append(fill);
      card.append(bar);
      var ul = el('ul', 'stage-list');
      members.forEach(function (t) {
        var li = el('li', isEarned(t) ? 'done' : '');
        var a = el('a', null, (isEarned(t) ? '✓ ' : '') + (isSpoiled(t) ? 'Hidden story trophy' : t.name));
        a.href = '#/trophy/' + t.id;
        li.append(a);
        ul.append(li);
      });
      card.append(ul);
      box.append(card);
    });
  }

  // ---------- missables ----------
  function renderMissables() {
    var box = document.getElementById('missable-list');
    box.replaceChildren();
    trophies.filter(function (t) { return t.missable; }).forEach(function (t) {
      var card = el('article', 'missable-card');
      card.append(gradeMark(t.grade));
      var h = el('h3', null, t.name + ' — ' + t.description);
      card.append(h);
      card.append(el('p', null, t.guide));
      var link = el('a', null, 'Open in the checklist →');
      link.href = '#/trophy/' + t.id;
      card.append(link);
      box.append(card);
    });
  }

  // ---------- save view ----------
  function renderSave() {
    var dl = document.getElementById('save-numbers');
    dl.replaceChildren();
    var rows = [
      ['Trophies earned', earnedCount() + ' / ' + trophies.length],
      ['Points', String(points()) + ' / 1,350'],
      ['Platinum', byId[1] && isEarned(byId[1]) ? 'Earned' : 'Not yet'],
      ['Counted progress tracked', Object.keys(state.counts).filter(function (k) { return state.counts[k] > 0; }).length + ' trophies'],
      ['Notes written', Object.keys(state.notes).filter(function (k) { return (state.notes[k] || '').trim(); }).length + ' trophies']
    ];
    rows.forEach(function (r) {
      dl.append(el('dt', null, r[0]));
      dl.append(el('dd', null, r[1]));
    });
  }

  function exportProgress() {
    var data = {
      app: 'leonida-trophy-guide',
      version: 1,
      exportedAt: new Date().toISOString(),
      earned: Object.keys(state.earned).map(Number).sort(function (a, b) { return a - b; }),
      counts: state.counts,
      notes: state.notes,
      spoiler: state.spoiler
    };
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = 'leonida-trophy-progress.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    document.getElementById('save-status').textContent = 'Exported ' + data.earned.length + ' earned trophies.';
  }

  function importProgress(file) {
    var status = document.getElementById('save-status');
    file.text().then(function (text) {
      var data;
      try { data = JSON.parse(text); } catch (e) { status.textContent = 'That file is not valid JSON.'; return; }
      var earned = Array.isArray(data.earned) ? data.earned : (Array.isArray(data) ? data : null);
      if (!earned) { status.textContent = 'That file does not look like a trophy-progress export.'; return; }
      state.earned = {};
      earned.forEach(function (id) { if (byId[id]) state.earned[id] = true; });
      state.counts = data.counts && typeof data.counts === 'object' ? data.counts : {};
      state.notes = data.notes && typeof data.notes === 'object' ? data.notes : {};
      if (typeof data.spoiler === 'boolean') state.spoiler = data.spoiler;
      document.getElementById('f-spoiler').checked = state.spoiler;
      save();
      renderAll();
      status.textContent = 'Imported ' + Object.keys(state.earned).length + ' earned trophies.';
    }).catch(function () { status.textContent = 'Could not read that file.'; });
  }

  // ---------- routing ----------
  function showView(name) {
    ['checklist', 'roadmap', 'missables', 'save'].forEach(function (v) {
      document.getElementById('view-' + v).hidden = (v !== name);
    });
    document.querySelectorAll('.tabs a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-tab') === name);
    });
    if (name === 'roadmap') renderRoadmap();
    if (name === 'missables') renderMissables();
    if (name === 'save') renderSave();
  }

  function route() {
    var hash = location.hash || '#/checklist';
    var m = hash.match(/^#\/trophy\/(\d+)$/);
    if (m && byId[Number(m[1])]) {
      selectedId = Number(m[1]);
      showView('checklist');
      renderList();
      renderDetail();
      var row = document.getElementById('trophy-' + selectedId);
      if (row) row.scrollIntoView({ block: 'nearest' });
      return;
    }
    var view = hash.replace(/^#\//, '').split('/')[0];
    if (['checklist', 'roadmap', 'missables', 'save'].indexOf(view) === -1) view = 'checklist';
    showView(view);
  }

  function renderAll() {
    renderStats();
    renderNextUp();
    renderList();
    renderDetail();
    renderRoadmap();
    renderMissables();
    renderSave();
  }

  // ---------- boot ----------
  function boot() {
    document.getElementById('f-spoiler').checked = state.spoiler;
    document.getElementById('f-spoiler').addEventListener('change', function (e) {
      state.spoiler = e.target.checked;
      save();
      renderAll();
    });
    ['q', 'f-kind', 'f-grade', 'f-status'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', renderList);
      document.getElementById(id).addEventListener('change', renderList);
    });
    document.getElementById('btn-export').addEventListener('click', exportProgress);
    document.getElementById('file-import').addEventListener('change', function (e) {
      if (e.target.files[0]) importProgress(e.target.files[0]);
      e.target.value = '';
    });
    document.getElementById('btn-reset').addEventListener('click', function () {
      if (!window.confirm('Reset all progress — earned trophies, counters and notes?')) return;
      state = { earned: {}, counts: {}, notes: {}, spoiler: state.spoiler };
      save();
      renderAll();
      document.getElementById('save-status').textContent = 'All progress reset.';
    });
    window.addEventListener('hashchange', route);

    fetch('data/trophies.json').then(function (r) { return r.json(); }).then(function (doc) {
      trophies = doc.trophies || [];
      trophies.forEach(function (t) { byId[t.id] = t; });
      renderAll();
      route();
    }).catch(function () {
      document.getElementById('trophy-list').innerHTML = '';
      var li = el('li', 'trophy-none', 'Could not load the trophy data. Open this guide from a local server (node serve.ts) or with file access enabled.');
      document.getElementById('trophy-list').append(li);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
