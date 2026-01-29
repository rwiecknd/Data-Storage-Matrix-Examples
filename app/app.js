(function () {
  'use strict';

  const DATA_JSON = 'data/services.json';
  const DATA_XLSX = 'Data_Storage_Matrix.xlsx';

  let state = {
    criteria: [],
    services: [],
    questions: [],
    nameKey: null,
    filterValues: {},
    selectedIds: new Set(),
  };

  function showLoading(show) {
    const el = document.getElementById('loading');
    if (el) el.classList.toggle('hidden', !show);
  }

  function showError(msg) {
    const el = document.getElementById('error');
    if (el) {
      el.textContent = msg;
      el.classList.remove('hidden');
    }
  }

  function hideError() {
    const el = document.getElementById('error');
    if (el) el.classList.add('hidden');
  }

  function parseSheetToData(rows) {
    if (!rows || rows.length < 2) return null;
    const headers = rows[0].map((h) => (h != null && h !== '' ? String(h).trim() : ''));
    const nameKey =
      headers.find((h) => String(h || '').trim().toLowerCase() === 'service') ||
      headers[0] ||
      'Service';
    const criteria = headers
      .filter((h) => h && h !== nameKey)
      .map((h) => ({ id: slug(h), label: h }));
    const services = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row.some((c) => c !== '' && c != null)) continue;
      const obj = {};
      headers.forEach((h, i) => {
        const key = h || 'Column_' + i;
        obj[key] = row[i] == null || row[i] === '' ? '' : String(row[i]).trim();
      });
      services.push(obj);
    }
    return { nameKey, criteria, services };
  }

  function parseQuestionsSheet(rows, criteria, services) {
    if (!rows || rows.length < 2 || !criteria.length) return [];
    const headers = (rows[0] || []).map((h) => (h != null ? String(h).trim() : ''));
    const questionCol = headers.findIndex((h) => /question/i.test(h || ''));
    const optionsCol = headers.findIndex((h) => /option/i.test(h || ''));
    if (questionCol < 0 || optionsCol < 0) return [];
    const optionValuesByColumn = {};
    criteria.forEach((c) => {
      const set = new Set();
      services.forEach((s) => {
        const v = (s[c.label] || '').trim();
        if (v) set.add(v.trim().toLowerCase());
      });
      optionValuesByColumn[c.label] = set;
    });
    const questions = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const questionText = (row[questionCol] ?? '').toString().trim();
      if (!questionText) continue;
      const optionsRaw = (row[optionsCol] ?? '').toString();
      const options = optionsRaw
        .split(/\r?\n/)
        .map((o) => o.trim())
        .filter(Boolean);
      if (!options.length) continue;
      const qId = slug(questionText) || 'q' + r;
      let bestColumn = null;
      let bestScore = 0;
      const qOptSet = new Set(options.map((o) => o.toLowerCase()));
      criteria.forEach((c) => {
        const colSet = optionValuesByColumn[c.label];
        let score = 0;
        qOptSet.forEach((opt) => {
          if (colSet.has(opt)) score++;
        });
        if (score > bestScore) {
          bestScore = score;
          bestColumn = c.label;
        }
      });
      questions.push({
        id: qId,
        label: questionText,
        options: options,
        column: bestColumn || criteria[questions.length]?.label || null,
      });
    }
    return questions;
  }

  function slug(s) {
    return String(s || '')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase() || 'col';
  }

  function getServiceId(svc) {
    return (svc[state.nameKey] || '').trim() || JSON.stringify(svc);
  }

  function loadFromJSON() {
    return fetch(DATA_JSON)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Not found'))))
      .then((data) => {
        if (!data.services) throw new Error('Invalid data format');
        state.criteria = data.criteria || [];
        state.services = data.services;
        state.questions = data.questions || [];
        state.nameKey =
          data.nameKey ||
          (state.services[0] ? Object.keys(state.services[0]).find((k) => /service/i.test(k)) : null) ||
          (state.services[0] ? Object.keys(state.services[0])[0] : null) ||
          'Service';
      });
  }

  function loadFromXLSX() {
    return fetch(DATA_XLSX)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('Not found'))))
      .then((buf) => {
        if (typeof XLSX === 'undefined') throw new Error('SheetJS not loaded');
        const wb = XLSX.read(buf, { type: 'array' });
        const matrixName = wb.SheetNames.find((n) => /matrix|data storage/i.test(n)) || wb.SheetNames[0];
        const ws = wb.Sheets[matrixName];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        const data = parseSheetToData(rows);
        if (!data) throw new Error('Excel has no data');
        state.nameKey = data.nameKey;
        state.criteria = data.criteria;
        state.services = data.services;
        const qName = wb.SheetNames.find((n) => /^questions$/i.test((n || '').trim()));
        if (qName) {
          const qRows = XLSX.utils.sheet_to_json(wb.Sheets[qName], { header: 1, defval: '' });
          state.questions = parseQuestionsSheet(qRows, state.criteria, state.services);
        } else {
          state.questions = [];
        }
      });
  }

  function loadData() {
    showLoading(true);
    hideError();
    loadFromJSON()
      .then(() => {
        if (!state.services.length) return loadFromXLSX();
      })
      .catch(() => loadFromXLSX())
      .then(() => {
        state.filterValues = {};
        state.selectedIds = new Set();
        renderCriteriaFilters();
        renderServicesList();
        updateCompareSection();
      })
      .catch((err) => {
        showError(
          'Could not load data. Add data/services.json (run: npm run build-data) or place Data_Storage_Matrix.xlsx in the app folder. ' +
            (err.message || '')
        );
      })
      .finally(() => showLoading(false));
  }

  function getUniqueValues(key) {
    const set = new Set();
    state.services.forEach((s) => {
      const v = (s[key] || '').trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort();
  }

  function getFilterSources() {
    return state.questions.length
      ? state.questions.filter((q) => q.column)
      : state.criteria.map((c) => ({ id: c.id, label: c.label, options: getUniqueValues(c.label), column: c.label }));
  }

  function renderCriteriaFilters() {
    const wrap = document.getElementById('criteria-filters');
    wrap.innerHTML = '';
    const sources = getFilterSources();
    sources.forEach((src) => {
      const columnKey = src.column || src.label;
      const anyLabel = '— Any —';
      const options = src.options ? [anyLabel, ...src.options] : [anyLabel, ...getUniqueValues(columnKey)];
      const div = document.createElement('div');
      div.className = 'filter-group';
      const label = document.createElement('label');
      label.textContent = src.label;
      const select = document.createElement('select');
      select.dataset.column = columnKey;
      options.forEach((opt) => {
        const o = document.createElement('option');
        o.value = opt === anyLabel ? '' : opt;
        o.textContent = opt;
        select.appendChild(o);
      });
      select.addEventListener('change', () => {
        state.filterValues[columnKey] = select.value;
        renderServicesList();
        updateCompareSection();
      });
      div.appendChild(label);
      div.appendChild(select);
      wrap.appendChild(div);
    });
  }

  function matchesFilters(service) {
    const sources = getFilterSources();
    for (const src of sources) {
      const columnKey = src.column || src.label;
      const chosen = state.filterValues[columnKey];
      if (!chosen) continue;
      const raw = (service[columnKey] || '').trim();
      const cellValues = raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
      const exactMatch = raw === chosen;
      const listMatch = cellValues.length > 0 && cellValues.some((v) => v === chosen);
      if (!exactMatch && !listMatch) return false;
    }
    return true;
  }

  function getFilteredServices() {
    return state.services.filter((s) => matchesFilters(s));
  }

  function getServiceDescription(svc) {
    const descKey = state.services[0] && Object.keys(state.services[0]).find((k) => /description/i.test(k));
    if (!descKey) return '';
    const raw = (svc[descKey] || '').trim();
    if (!raw) return '';
    const firstLine = raw.split(/\r?\n/)[0].trim();
    return firstLine.length > 140 ? firstLine.slice(0, 137) + '…' : firstLine;
  }

  function renderServicesList() {
    const list = document.getElementById('services-list');
    const countEl = document.getElementById('match-count');
    const filtered = getFilteredServices();
    if (countEl) countEl.textContent = filtered.length + ' of ' + state.services.length;

    list.innerHTML = '';
    state.services.forEach((svc) => {
      const name = (svc[state.nameKey] || '').trim() || 'Unnamed';
      const desc = getServiceDescription(svc);
      const id = getServiceId(svc);
      const matches = matchesFilters(svc);
      const box = document.createElement('label');
      box.className =
        'service-box ' +
        (matches ? 'matches' : 'no-match') +
        (state.selectedIds.has(id) ? ' selected' : '');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = state.selectedIds.has(id);
      const selectDiv = document.createElement('span');
      selectDiv.className = 'service-box-select';
      selectDiv.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('div');
      inner.className = 'service-box-inner';
      const nameEl = document.createElement('div');
      nameEl.className = 'service-box-name';
      nameEl.textContent = name;
      const descEl = document.createElement('p');
      descEl.className = 'service-box-desc' + (desc ? '' : ' empty');
      descEl.textContent = desc || '';
      box.appendChild(input);
      box.appendChild(selectDiv);
      inner.appendChild(nameEl);
      inner.appendChild(descEl);
      box.appendChild(inner);
      list.appendChild(box);

      function syncSelection() {
        if (input.checked) state.selectedIds.add(id);
        else state.selectedIds.delete(id);
        box.classList.toggle('selected', input.checked);
        updateCompareSection();
      }
      input.addEventListener('change', syncSelection);
      box.addEventListener('click', (e) => {
        e.preventDefault();
        input.checked = !input.checked;
        syncSelection();
      });
    });
  }

  function updateCompareSection() {
    const wrap = document.getElementById('compare-table-wrap');
    const table = document.getElementById('compare-table');
    if (!wrap || !table) return;
    const selected = state.services.filter((s) => state.selectedIds.has(getServiceId(s)));
    if (selected.length === 0) {
      wrap.classList.add('hidden');
      return;
    }
    wrap.classList.remove('hidden');
    buildCompareTable(table, selected);
  }

  function buildCompareTable(table, selected) {
    table.innerHTML = '';
    const headers = [state.nameKey, ...state.criteria.map((c) => c.label)];
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    headers.forEach((h) => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    selected.forEach((svc) => {
      const tr = document.createElement('tr');
      headers.forEach((key) => {
        const td = document.createElement('td');
        td.textContent = (svc[key] || '').trim() || '—';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  document.getElementById('clear-filters')?.addEventListener('click', () => {
    state.filterValues = {};
    document.querySelectorAll('#criteria-filters select').forEach((s) => {
      s.value = s.options[0]?.value ?? '';
    });
    renderServicesList();
    updateCompareSection();
  });

  document.getElementById('select-all')?.addEventListener('click', () => {
    getFilteredServices().forEach((s) => state.selectedIds.add(getServiceId(s)));
    renderServicesList();
    updateCompareSection();
  });

  document.getElementById('clear-selection')?.addEventListener('click', () => {
    state.selectedIds.clear();
    renderServicesList();
    updateCompareSection();
  });

  loadData();
})();
