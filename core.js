export const anchorFields = [
  { key: 'character', label: 'Character', hint: 'Who is in this scene?' },
  { key: 'appearance', label: 'Appearance', hint: 'Hair, defining features, age range' },
  { key: 'wardrobe', label: 'Wardrobe', hint: 'Clothing and accessories' },
  { key: 'prop', label: 'Key prop', hint: 'Object that must remain recognizable' },
  { key: 'location', label: 'Location', hint: 'Setting and fixed details' },
  { key: 'lighting', label: 'Lighting', hint: 'Time and light direction' }
];

const shotFields = ['title', 'action', 'camera', 'duration', 'notes', ...anchorFields.map((field) => field.key)];
const maxShots = 100;

function cleanText(value, maxLength = 800) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function comparable(value) {
  return cleanText(value).replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function normalizeProject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('The project must be a JSON object.');
  }
  if (!value.bible || typeof value.bible !== 'object' || Array.isArray(value.bible)) {
    throw new Error('The project needs a bible object.');
  }
  if (!Array.isArray(value.shots) || value.shots.length > maxShots) {
    throw new Error(`The project needs a shots array with at most ${maxShots} shots.`);
  }

  const bible = Object.fromEntries(anchorFields.map(({ key }) => [key, cleanText(value.bible[key], 300)]));
  const shots = value.shots.map((incoming, index) => {
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
      throw new Error(`Shot ${index + 1} must be an object.`);
    }
    const shot = { id: cleanText(incoming.id, 64) || `shot-${index + 1}` };
    for (const field of shotFields) shot[field] = cleanText(incoming[field], field === 'action' ? 1000 : 400);
    return shot;
  });

  return {
    schemaVersion: 1,
    title: cleanText(value.title, 120) || 'Untitled scene',
    premise: cleanText(value.premise, 400),
    look: cleanText(value.look, 400),
    bible,
    shots
  };
}

export function analyzeShot(project, shot) {
  const issues = [];
  for (const { key, label } of anchorFields) {
    const expected = cleanText(project.bible?.[key]);
    if (!expected) continue;
    const actual = cleanText(shot[key]);
    if (!actual) {
      issues.push({ field: key, label, kind: 'missing', expected, actual: '' });
    } else if (comparable(actual) !== comparable(expected)) {
      issues.push({ field: key, label, kind: 'drift', expected, actual });
    }
  }
  return {
    id: shot.id,
    title: shot.title || 'Untitled shot',
    issues,
    driftCount: issues.filter((issue) => issue.kind === 'drift').length,
    missingCount: issues.filter((issue) => issue.kind === 'missing').length
  };
}

export function analyzeProject(project) {
  const shots = project.shots.map((shot) => analyzeShot(project, shot));
  return {
    shots,
    driftCount: shots.reduce((sum, shot) => sum + shot.driftCount, 0),
    missingCount: shots.reduce((sum, shot) => sum + shot.missingCount, 0),
    cleanCount: shots.filter((shot) => shot.issues.length === 0).length
  };
}

export function buildLockedPrompt(project, shot) {
  const lines = [];
  lines.push(`Scene: ${project.title || 'Untitled scene'}`);
  if (project.premise) lines.push(`Story context: ${project.premise}`);
  if (project.look) lines.push(`Visual treatment: ${project.look}`);
  lines.push('');
  lines.push(`Shot: ${shot.title || 'Untitled shot'}`);
  if (shot.action) lines.push(`Action: ${shot.action}`);
  if (shot.camera) lines.push(`Camera: ${shot.camera}`);
  if (shot.duration) lines.push(`Duration: ${shot.duration}`);
  lines.push('');
  lines.push('Keep these scene anchors consistent:');
  for (const { key, label } of anchorFields) {
    const locked = cleanText(project.bible?.[key]);
    if (locked) lines.push(`${label}: ${locked}`);
  }
  if (shot.notes) {
    lines.push('');
    lines.push(`Production note: ${shot.notes}`);
  }
  return lines.join('\n').trim();
}

export function exportMarkdown(project) {
  const report = analyzeProject(project);
  const lines = [`# ${project.title}`, ''];
  if (project.premise) lines.push(project.premise, '');
  if (project.look) lines.push(`Visual treatment: ${project.look}`, '');
  lines.push('## Scene bible', '');
  for (const { key, label } of anchorFields) {
    if (project.bible[key]) lines.push(`- **${label}:** ${project.bible[key]}`);
  }
  lines.push('', '## Shots', '');
  project.shots.forEach((shot, index) => {
    const checked = report.shots[index];
    lines.push(`### ${String(index + 1).padStart(2, '0')} — ${shot.title || 'Untitled shot'}`, '');
    lines.push('#### Continuity checks', '');
    if (checked.issues.length === 0) lines.push('No continuity issues found.');
    for (const issue of checked.issues) {
      lines.push(`- **${issue.kind === 'drift' ? 'Drift' : 'Missing'}: ${issue.label}.** Expected: ${issue.expected}${issue.actual ? `; found: ${issue.actual}` : ''}.`);
    }
    lines.push('', '#### Locked prompt', '', '```text', buildLockedPrompt(project, shot), '```', '');
  });
  return lines.join('\n').trim() + '\n';
}
