import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeProject, analyzeShot, buildLockedPrompt, exportMarkdown, normalizeProject } from '../core.js';
import { demoProject } from '../sample.js';

test('demo exposes specific drift and missing anchors', () => {
  const report = analyzeProject(demoProject);
  assert.equal(report.shots.length, 5);
  assert.ok(report.driftCount >= 2);
  assert.ok(report.missingCount >= 1);
  assert.ok(report.shots.some((shot) => shot.issues.some((issue) => issue.field === 'wardrobe' && issue.kind === 'drift')));
});

test('checks ignore case and extra spacing but still identify a changed value', () => {
  const project = structuredClone(demoProject);
  const shot = project.shots[0];
  shot.character = `  ${project.bible.character.toUpperCase()}  `;
  assert.equal(analyzeShot(project, shot).issues.some((issue) => issue.field === 'character'), false);
  shot.character = 'Another person';
  assert.equal(analyzeShot(project, shot).issues.find((issue) => issue.field === 'character')?.kind, 'drift');
});

test('locked prompt uses canonical values and does not silently copy drift', () => {
  const project = structuredClone(demoProject);
  const shot = project.shots[1];
  shot.wardrobe = 'purple coat';
  const prompt = buildLockedPrompt(project, shot);
  assert.match(prompt, new RegExp(project.bible.wardrobe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(prompt, /purple coat/i);
  assert.match(prompt, /Action:/);
});

test('import validates structure and strips unknown fields', () => {
  assert.throws(() => normalizeProject({ title: 'No shots', bible: {} }), /shots/i);
  const incoming = structuredClone(demoProject);
  incoming.secret = 'discard me';
  incoming.shots[0].secret = 'discard me';
  const normalized = normalizeProject(incoming);
  assert.equal(normalized.secret, undefined);
  assert.equal(normalized.shots[0].secret, undefined);
  assert.equal(normalized.shots.length, 5);
});

test('markdown export includes the scene, checks, and locked prompts', () => {
  const markdown = exportMarkdown(demoProject);
  assert.match(markdown, new RegExp(demoProject.title));
  assert.match(markdown, /Continuity checks/);
  assert.match(markdown, /Locked prompt/);
  assert.match(markdown, /Drift:/);
});
