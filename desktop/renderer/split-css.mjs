#!/usr/bin/env node
/* Découpe styles.css en fichiers par composant.
   Usage : node split-css.mjs
   Résultat : crée les fichiers CSS + met à jour styles.css avec @import. */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const dir = resolve(import.meta.dirname);
const css = readFileSync(resolve(dir, 'styles.css'), 'utf8');

/* ---------- définition des fichiers cibles ---------- */
const FILES = {
  'variables.css': {
    start: 1,
    end: 139,
    desc: 'Variables CSS, thème clair/nuit, reset',
  },
  'layout.css': {
    start: 140,
    end: 215,
    desc: 'Grid layout, resizers, sidebar structure',
  },
  'sidebar.css': {
    start: 216,
    end: 600,
    desc: 'Sidebar sections, providers, projects, conversations, model picker, usage, theme toggle',
  },
  'chat.css': {
    start: 601,
    end: 1149,
    desc: 'Chat column, messages, composer, scroll, streaming animation, conversations',
  },
  'icons.css': {
    start: 1150,
    end: 1248,
    desc: 'Logo castor, SVG icons, icônes inline',
  },
  'projects.css': {
    start: 1249,
    end: 1345,
    desc: 'Project list, file tree, drag & drop',
  },
  'header.css': {
    start: 1346,
    end: 1505,
    desc: 'Workspace chip, build/plan modes, queue, attachments, tool trace',
  },
  'modals.css': {
    start: 1506,
    end: 1683,
    desc: 'Diff modal, approval, conversations search',
  },
  'panel.css': {
    start: 1684,
    end: 2141,
    desc: 'Side panel, changes, files, plan, terminal, notes, tools',
  },
};

/* ---------- découpage ---------- */
const lines = css.split('\n');
const total = lines.length;

for (const [file, { start, end }] of Object.entries(FILES)) {
  const slice = lines.slice(start - 1, end).join('\n');
  writeFileSync(resolve(dir, file), slice, 'utf8');
  console.log(`✓ ${file} (${slice.split('\n').length} lignes, lignes ${start}-${end})`);
}

/* ---------- styles.css principal : @import des fichiers ---------- */
const imports = Object.entries(FILES)
  .map(([file]) => `@import url('${file}');`)
  .join('\n');

writeFileSync(resolve(dir, 'styles.css'), imports + '\n', 'utf8');
console.log(`\n✓ styles.css réécrit avec ${Object.keys(FILES).length} @import`);
console.log(`  (ancien : ${total} lignes → nouveau : ${imports.split('\n').length} lignes)`);