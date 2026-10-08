'use strict';
const $ = id => document.getElementById(id);
const categoryNames = {local:'局部编辑',local_replace:'局部替换',local_add:'局部添加',local_remove:'局部移除',background_change:'背景修改',style_change:'风格修改',global:'全局编辑',global_style:'全局风格',mix_global:'混合数据 · 全局',mix_global_freeform3:'混合数据 · 自由编辑',mix_global_style:'混合数据 · 风格',mix_sim2real:'混合数据 · Sim2Real'};
const categoryLabel = name => categoryNames[name] || name;
let manifest, filtered = [], selected, page = 0;
const pageSize = 12;
function selectSample(sample, scroll = false) {
  selected = sample;
  const id = String(sample.index).padStart(3, '0');
  $('sample-number').textContent = `SAMPLE ${id} / STEP 11000`;
  $('sample-title').textContent = categoryLabel(sample.category) + ' · ' + sample.id;
  $('instruction').textContent = sample.instruction;
  $('sample-meta').textContent = `${sample.frames} 帧 · ${sample.fps} FPS · ${(sample.bytes / 1048576).toFixed(2)} MiB${sample.mask_all_ones ? ' · 全局 GT mask = 1' : ' · 局部 GT mask 并集'}`;
  const video = $('main-video');
  video.pause(); video.poster = `posters/${id}.jpg`; video.src = sample.video; video.load();
  $('download-video').href = sample.video;
  const position = filtered.findIndex(s => s.index === sample.index);
  $('previous').disabled = position <= 0;
  $('next').disabled = position < 0 || position >= filtered.length - 1;
  history.replaceState(null, '', '#' + id);
  renderCards();
  if (scroll) document.querySelector('.viewer').scrollIntoView({behavior:'smooth', block:'start'});
}
function renderCards() {
  $('cards').replaceChildren();
  const start = page * pageSize;
  for (const sample of filtered.slice(start, start + pageSize)) {
    const id = String(sample.index).padStart(3, '0');
    const card = document.createElement('button');
    card.className = 'card' + (selected?.index === sample.index ? ' selected' : '');
    card.setAttribute('aria-label', `打开样例 ${id}：${sample.instruction}`);
    const image = document.createElement('img'); image.src = `posters/${id}.jpg`; image.alt = `样例 ${id} 五栏预览`; image.loading = 'lazy';
    const info = document.createElement('div'); info.className = 'card-info';
    const top = document.createElement('div'); top.className = 'card-top';
    const number = document.createElement('span'); number.className = 'card-index'; number.textContent = id;
    const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = categoryLabel(sample.category);
    const instruction = document.createElement('p'); instruction.textContent = sample.instruction;
    top.append(number, tag); info.append(top, instruction); card.append(image, info);
    card.addEventListener('click', () => selectSample(sample, true)); $('cards').append(card);
  }
  if (!filtered.length) {const message = document.createElement('p'); message.className = 'empty'; message.textContent = '没有匹配的样例，请尝试其他任务或关键词。'; $('cards').append(message);}
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  $('page-status').textContent = `${page + 1} / ${pages}`;
  $('page-prev').disabled = page === 0; $('page-next').disabled = page + 1 >= pages;
  $('result-count').textContent = `${filtered.length} / 100`;
}
function applyFilters() {
  const query = $('search').value.trim().toLocaleLowerCase(), category = $('category').value;
  filtered = manifest.samples.filter(s => (category === 'all' || s.category === category) && `${String(s.index).padStart(3,'0')} ${s.id} ${s.instruction}`.toLocaleLowerCase().includes(query));
  page = 0;
  if (filtered.length && !filtered.some(s => s.index === selected?.index)) selectSample(filtered[0]);
  else {renderCards(); const pos = filtered.findIndex(s => s.index === selected?.index); $('previous').disabled = pos <= 0; $('next').disabled = pos < 0 || pos + 1 >= filtered.length;}
}
function navigate(direction) {
  const pos = filtered.findIndex(s => s.index === selected?.index);
  const sample = filtered[pos + direction];
  if (sample) {page = Math.floor((pos + direction) / pageSize); selectSample(sample);}
}
async function init() {
  const response = await fetch('manifest.json');
  if (!response.ok) throw new Error('样例清单无法读取');
  manifest = await response.json(); filtered = manifest.samples;
  const counts = {};
  for (const sample of filtered) counts[sample.category] = (counts[sample.category] || 0) + 1;
  for (const [category, count] of Object.entries(counts)) {const option = document.createElement('option'); option.value = category; option.textContent = `${categoryLabel(category)} (${count})`; $('category').append(option);}
  const id = Number(location.hash.slice(1));
  const initial = filtered.find(s => s.index === id) || filtered[0];
  page = Math.floor(initial.index / pageSize); selectSample(initial);
  $('search').addEventListener('input', applyFilters); $('category').addEventListener('change', applyFilters);
  $('previous').addEventListener('click', () => navigate(-1)); $('next').addEventListener('click', () => navigate(1));
  $('page-prev').addEventListener('click', () => {page--; renderCards();}); $('page-next').addEventListener('click', () => {page++; renderCards();});
}
init().catch(error => {$('sample-title').textContent = '页面加载失败'; $('instruction').textContent = error.message; console.error(error);});
