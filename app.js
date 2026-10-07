import { anchorFields, analyzeProject, buildLockedPrompt, exportMarkdown, normalizeProject } from './core.js';
import { demoProject } from './sample.js';

const storageKey = 'framekeeper-project-v1';
const app = document.querySelector('#app');
let project = loadProject();
let activeShotIndex = Math.min(2, Math.max(0, project.shots.length - 1));
let toastTimer;

function loadProject() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) return normalizeProject(JSON.parse(saved));
  } catch (error) {
    console.warn('Could not load the saved scene:', error);
  }
  return normalizeProject(structuredClone(demoProject));
}

function saveProject() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(project));
    const saveStatus = document.querySelector('#save-status');
    if (saveStatus) saveStatus.textContent = 'Saved on this device';
  } catch {
    const saveStatus = document.querySelector('#save-status');
    if (saveStatus) saveStatus.textContent = 'Local save unavailable — export your work';
  }
}

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function button(label, action, className = '') {
  const element = node('button', className, label);
  element.type = 'button';
  element.dataset.action = action;
  return element;
}

function formField({ label, value, path, key, hint, multiline = false, rows = 2 }) {
  const wrap = node('div', 'form-field');
  const id = `${path}-${key}`;
  const labelEl = node('label', 'field-label', label);
  labelEl.htmlFor = id;
  const control = node(multiline ? 'textarea' : 'input', 'field-control');
  control.id = id;
  control.dataset.path = path;
  control.dataset.key = key;
  control.value = value || '';
  if (multiline) control.rows = rows;
  else control.type = 'text';
  if (hint) control.placeholder = hint;
  wrap.append(labelEl, control);
  return wrap;
}

function showToast(message, kind = 'success') {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.kind = kind;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
}

function alignActiveShot() {
  const rail = document.querySelector('#shot-rail');
  const active = rail?.querySelector('.active');
  if (active && rail.scrollWidth > rail.clientWidth) {
    rail.scrollLeft = active.offsetLeft - rail.offsetLeft - (rail.clientWidth - active.clientWidth) / 2;
  }
}

function renderRail(report) {
  const rail = document.querySelector('#shot-rail');
  rail.replaceChildren();
  project.shots.forEach((shot, index) => {
    const checked = report.shots[index];
    const item = button('', 'select-shot', 'shot-tab');
    item.dataset.index = String(index);
    item.setAttribute('aria-current', index === activeShotIndex ? 'step' : 'false');
    item.classList.toggle('active', index === activeShotIndex);
    item.classList.toggle('has-drift', checked.driftCount > 0);
    const count = node('span', 'shot-number', String(index + 1).padStart(2, '0'));
    const detail = node('span', 'shot-tab-detail');
    detail.append(node('span', 'shot-tab-title', shot.title || 'Untitled shot'));
    detail.append(node('span', 'shot-tab-state', checked.driftCount ? `${checked.driftCount} drift` : checked.missingCount ? `${checked.missingCount} missing` : 'Clear'));
    item.append(count, detail);
    rail.append(item);
  });
  alignActiveShot();
}

function renderIssues(checked) {
  const list = document.querySelector('#issue-list');
  list.replaceChildren();
  if (checked.issues.length === 0) {
    const empty = node('div', 'issue-empty');
    empty.append(node('span', 'empty-mark'));
    empty.append(node('strong', '', 'This shot matches the scene bible.'));
    empty.append(node('p', '', 'Your locked prompt is ready to copy.'));
    list.append(empty);
    return;
  }
  for (const issue of checked.issues) {
    const item = node('div', `issue issue-${issue.kind}`);
    const top = node('div', 'issue-top');
    top.append(node('span', 'issue-kind', issue.kind === 'drift' ? 'DRIFT' : 'MISSING'));
    top.append(node('strong', 'issue-field', issue.label));
    const description = node('p', 'issue-description');
    if (issue.kind === 'drift') description.textContent = `Shot says “${issue.actual}”.`;
    else description.textContent = 'This detail is not set for the shot.';
    const expected = node('p', 'issue-expected', `Bible: ${issue.expected}`);
    const fix = button('Use bible value', 'fix-field', 'text-button');
    fix.dataset.field = issue.field;
    item.append(top, description, expected, fix);
    list.append(item);
  }
}

function refreshDerived() {
  const report = analyzeProject(project);
  const shot = project.shots[activeShotIndex];
  const checked = report.shots[activeShotIndex];
  document.querySelector('#shot-count').textContent = `${project.shots.length} ${project.shots.length === 1 ? 'shot' : 'shots'}`;
  document.querySelector('#drift-count').textContent = `${report.driftCount} drift`;
  document.querySelector('#missing-count').textContent = `${report.missingCount} missing`;
  document.querySelector('#current-shot-number').textContent = `SHOT ${String(activeShotIndex + 1).padStart(2, '0')}`;
  document.querySelector('#current-shot-title').textContent = shot.title || 'Untitled shot';
  document.querySelector('#issue-summary').textContent = checked.issues.length === 0
    ? 'All six scene anchors are aligned.'
    : `${checked.driftCount} drift · ${checked.missingCount} missing`;
  document.querySelector('#fix-all').hidden = checked.issues.length === 0;
  document.querySelector('#locked-prompt').textContent = buildLockedPrompt(project, shot);
  renderRail(report);
  renderIssues(checked);
}

function render() {
  activeShotIndex = Math.max(0, Math.min(activeShotIndex, project.shots.length - 1));
  if (project.shots.length === 0) {
    project.shots.push(newShot(1));
    activeShotIndex = 0;
  }
  app.innerHTML = `
    <header class="masthead">
      <div class="brand"><span class="brand-mark" aria-hidden="true"><span></span></span><span>FrameKeeper</span></div>
      <div class="masthead-right"><span class="local-indicator">LOCAL WORKSPACE</span><a href="https://github.com/maomao-1937/framekeeper-ai-continuity" target="_blank" rel="noopener noreferrer">Source code</a></div>
    </header>
    <main class="app-shell">
      <section class="scene-header" aria-labelledby="page-title">
        <div class="scene-heading"><div><h1 id="page-title">One scene. Every shot in sync.</h1><p>Catch visual drift before you generate the next take.</p></div><div class="scene-summary" aria-label="Scene status"><span id="shot-count"></span><span id="drift-count"></span><span id="missing-count"></span></div></div>
        <div class="scene-controls"><div id="scene-title-field"></div><div class="scene-actions"><button type="button" data-action="new-scene" class="button secondary">New scene</button><button type="button" data-action="load-demo" class="button secondary">Load demo</button><button type="button" data-action="import" class="button secondary">Import JSON</button><button type="button" data-action="export-json" class="button secondary">Export JSON</button><button type="button" data-action="export-markdown" class="button primary">Export pack</button></div></div>
        <input id="import-file" type="file" accept="application/json,.json" hidden />
        <div class="save-line"><span class="save-dot" aria-hidden="true"></span><span id="save-status">Saved on this device</span><span>Demo content is synthetic.</span></div>
      </section>
      <section class="timeline-section" aria-labelledby="timeline-title"><div class="section-heading"><h2 id="timeline-title">Shot sequence</h2><span>Choose a shot to inspect</span></div><div class="timeline-wrap"><div id="shot-rail" class="shot-rail" role="group" aria-label="Shots"></div><button type="button" data-action="add-shot" class="add-shot"><span aria-hidden="true"></span> Add shot</button></div></section>
      <section class="workspace" aria-label="Continuity workspace">
        <aside class="bible-panel"><div class="panel-heading"><div><h2>Scene bible</h2><p>The details every shot should keep.</p></div></div><div id="bible-fields" class="panel-body"></div><div class="bible-footer"><div id="premise-field"></div><div id="look-field"></div></div></aside>
        <section class="shot-panel" aria-labelledby="shot-panel-title"><div class="panel-heading"><div><span class="panel-overline" id="current-shot-number"></span><h2 id="shot-panel-title"><span id="current-shot-title"></span></h2><p>Edit this take; the sequence updates as you work.</p></div><button type="button" data-action="remove-shot" class="icon-button" title="Remove this shot" aria-label="Remove this shot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v6m4-6v6"/></svg></button></div><div id="shot-fields" class="panel-body"></div></section>
        <aside class="output-panel"><div class="checks-section"><div class="panel-heading"><div><h2>Continuity checks</h2><p id="issue-summary"></p></div><button id="fix-all" type="button" data-action="fix-all" class="text-button">Fix all</button></div><div id="issue-list" class="issue-list"></div></div><div class="prompt-section"><div class="prompt-head"><div><h2>Locked prompt</h2><p>Uses the bible's approved details.</p></div><button type="button" data-action="copy-prompt" class="button copy-button">Copy prompt</button></div><pre id="locked-prompt" tabindex="0"></pre></div></aside>
      </section>
      <footer class="footer"><p>FrameKeeper checks explicit scene fields. It cannot inspect generated frames or infer visual facts from prose.</p><p>Runs in your browser · No account · No API key</p></footer>
    </main>
    <div id="toast" role="status" aria-live="polite"></div>
  `;

  const titleWrap = document.querySelector('#scene-title-field');
  titleWrap.append(formField({ label: 'SCENE NAME', value: project.title, path: 'project', key: 'title', hint: 'Name this scene' }));
  const bibleWrap = document.querySelector('#bible-fields');
  for (const field of anchorFields) {
    bibleWrap.append(formField({ label: field.label, value: project.bible[field.key], path: 'bible', key: field.key, hint: field.hint, multiline: field.key === 'appearance' || field.key === 'wardrobe' || field.key === 'location', rows: 2 }));
  }
  document.querySelector('#premise-field').append(formField({ label: 'STORY CONTEXT', value: project.premise, path: 'project', key: 'premise', hint: 'What happens in this scene?', multiline: true, rows: 3 }));
  document.querySelector('#look-field').append(formField({ label: 'VISUAL TREATMENT', value: project.look, path: 'project', key: 'look', hint: 'Mood, texture, and style rules', multiline: true, rows: 3 }));

  const shot = project.shots[activeShotIndex];
  const shotWrap = document.querySelector('#shot-fields');
  shotWrap.append(formField({ label: 'SHOT NAME', value: shot.title, path: 'shot', key: 'title', hint: 'A short label for this take' }));
  shotWrap.append(formField({ label: 'ACTION', value: shot.action, path: 'shot', key: 'action', hint: 'What visibly happens?', multiline: true, rows: 3 }));
  const pair = node('div', 'field-pair');
  pair.append(formField({ label: 'CAMERA', value: shot.camera, path: 'shot', key: 'camera', hint: 'Framing and movement' }));
  pair.append(formField({ label: 'DURATION', value: shot.duration, path: 'shot', key: 'duration', hint: 'e.g. 5 seconds' }));
  shotWrap.append(pair);
  const divider = node('div', 'field-divider');
  divider.append(node('h3', '', 'Scene anchors'));
  divider.append(node('p', '', 'These values are checked against the bible.'));
  shotWrap.append(divider);
  for (const field of anchorFields) {
    shotWrap.append(formField({ label: field.label, value: shot[field.key], path: 'shot', key: field.key, hint: `Expected: ${project.bible[field.key] || 'not set'}`, multiline: field.key === 'appearance' || field.key === 'wardrobe' || field.key === 'location', rows: 2 }));
  }
  shotWrap.append(formField({ label: 'PRODUCTION NOTE', value: shot.notes, path: 'shot', key: 'notes', hint: 'Optional note for this shot', multiline: true, rows: 2 }));
  refreshDerived();
}

function newShot(number) {
  return { id: `shot-${Date.now()}-${number}`, title: `New shot ${number}`, action: '', camera: '', duration: '', notes: '', ...Object.fromEntries(anchorFields.map(({ key }) => [key, ''])) };
}

function download(filename, contents, mimeType) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = node('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'scene';
}

app.addEventListener('input', (event) => {
  const control = event.target.closest('[data-path][data-key]');
  if (!control) return;
  const { path, key } = control.dataset;
  if (path === 'bible') project.bible[key] = control.value;
  else if (path === 'shot') project.shots[activeShotIndex][key] = control.value;
  else project[key] = control.value;
  saveProject();
  refreshDerived();
});

app.addEventListener('click', async (event) => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const { action } = control.dataset;
  if (action === 'select-shot') {
    activeShotIndex = Number(control.dataset.index);
    render();
  } else if (action === 'add-shot') {
    project.shots.push(newShot(project.shots.length + 1));
    activeShotIndex = project.shots.length - 1;
    saveProject(); render(); showToast('Shot added. Add its scene anchors to clear the checks.');
  } else if (action === 'remove-shot') {
    if (project.shots.length === 1) return showToast('A scene needs at least one shot.', 'error');
    if (!window.confirm(`Remove “${project.shots[activeShotIndex].title || 'this shot'}”?`)) return;
    project.shots.splice(activeShotIndex, 1);
    activeShotIndex = Math.min(activeShotIndex, project.shots.length - 1);
    saveProject(); render(); showToast('Shot removed.');
  } else if (action === 'fix-field') {
    const key = control.dataset.field;
    project.shots[activeShotIndex][key] = project.bible[key];
    saveProject(); render(); showToast(`${anchorFields.find((field) => field.key === key).label} now matches the bible.`);
  } else if (action === 'fix-all') {
    const checked = analyzeProject(project).shots[activeShotIndex];
    for (const issue of checked.issues) project.shots[activeShotIndex][issue.field] = project.bible[issue.field];
    saveProject(); render(); showToast('All anchors in this shot now match the bible.');
  } else if (action === 'copy-prompt') {
    try {
      await navigator.clipboard.writeText(buildLockedPrompt(project, project.shots[activeShotIndex]));
      showToast('Locked prompt copied.');
    } catch {
      showToast('Clipboard unavailable. Select and copy the prompt below.', 'error');
      document.querySelector('#locked-prompt').focus();
    }
  } else if (action === 'export-json') {
    download(`${slug(project.title)}.json`, JSON.stringify(project, null, 2) + '\n', 'application/json');
    showToast('Scene JSON downloaded.');
  } else if (action === 'export-markdown') {
    download(`${slug(project.title)}-continuity-pack.md`, exportMarkdown(project), 'text/markdown');
    showToast('Continuity pack downloaded.');
  } else if (action === 'import') {
    document.querySelector('#import-file').click();
  } else if (action === 'load-demo') {
    if (!window.confirm('Replace the current scene with the synthetic demo? Export first if you want to keep your work.')) return;
    project = normalizeProject(structuredClone(demoProject));
    activeShotIndex = 2;
    saveProject(); render(); showToast('Synthetic demo loaded.');
  } else if (action === 'new-scene') {
    if (!window.confirm('Start a new scene? Export first if you want to keep your work.')) return;
    project = normalizeProject({ title: 'Untitled scene', premise: '', look: '', bible: {}, shots: [newShot(1)] });
    activeShotIndex = 0;
    saveProject(); render(); showToast('New scene ready.');
  }
});

app.addEventListener('change', async (event) => {
  if (event.target.id !== 'import-file') return;
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > 2_000_000) throw new Error('The JSON file is larger than 2 MB.');
    project = normalizeProject(JSON.parse(await file.text()));
    activeShotIndex = 0;
    saveProject(); render(); showToast('Scene imported.');
  } catch (error) {
    showToast(`Import failed: ${error.message}`, 'error');
    event.target.value = '';
  }
});

render();
window.addEventListener('resize', alignActiveShot);
