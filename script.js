/* ─── Persistent state ─── */
// Helper to get formatted date as DD/MM/YYYY HH:MM AM/PM
function getFormattedDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  let hour12 = hours % 12;
  if (hour12 === 0) hour12 = 12;
  const hourStr = String(hour12).padStart(2, '0');
  return `${day}/${month}/${year} ${hourStr}:${minutes} ${ampm}`;
}

const incomeForm = document.getElementById('income-form');
const expenseForm = document.getElementById('expense-form');
let incomes  = JSON.parse(localStorage.getItem('incomes'))  || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

let editIncomeIndex  = null;
let editExpenseIndex = null;

/* === Core save (also refresh charts) === */
function saveData() {
  localStorage.setItem('incomes', JSON.stringify(incomes));
  localStorage.setItem('expenses', JSON.stringify(expenses));
  // keep charts in sync
  try { renderCharts(); } catch (e) { /* ignore if charts not ready yet */ }
}

/* ──────────────────────────────────────────────────────────
   INCOME: add / edit / delete
   ──────────────────────────────────────────────────────────*/
incomeForm.addEventListener('submit', e => {
  e.preventDefault();
  const source = document.getElementById('income-source').value.toUpperCase().trim();
  const amount = parseFloat(document.getElementById('income-amount').value);
  if (!source || isNaN(amount)) return;
  const entry = { source, amount, date: getFormattedDate() };
  if (editIncomeIndex !== null) {
    incomes[editIncomeIndex] = entry;
    editIncomeIndex = null;
    incomeForm.querySelector('button').textContent = 'Add Income';
  } else {
    incomes.push(entry);
  }
  saveData();
  renderIncomes();
  updateSummary();
  incomeForm.reset();
});

function renderIncomes() {
  const tbody = document.getElementById('income-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  incomes.forEach((inc, i) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${inc.source}</td>
      <td>₦${inc.amount.toFixed(2)}</td>
      <td>${inc.date}</td>
      <td>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>`;
    row.querySelector('.edit-btn').onclick = () => beginEditIncome(i);
    row.querySelector('.delete-btn').onclick = () => deleteIncome(i);
  });
}

function beginEditIncome(i) {
  const inc = incomes[i];
  document.getElementById('income-source').value = inc.source;
  document.getElementById('income-amount').value = inc.amount;
  incomeForm.querySelector('button').textContent = 'Update Income';
  editIncomeIndex = i;
}

function deleteIncome(i) {
  if (!confirm('Delete this income entry?')) return;
  incomes.splice(i, 1);
  saveData();
  renderIncomes();
  updateSummary();
}

/* ──────────────────────────────────────────────────────────
   EXPENSE: add / edit / delete
   ──────────────────────────────────────────────────────────*/
expenseForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('expense-title').value.toUpperCase().trim();
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const category = document.getElementById('expense-category').value;
  if (!title || isNaN(amount)) return;
  const entry = { title, amount, category, date: getFormattedDate() };
  if (editExpenseIndex !== null) {
    expenses[editExpenseIndex] = entry;
    editExpenseIndex = null;
    expenseForm.querySelector('button').textContent = 'Add Expense';
  } else {
    expenses.push(entry);
  }
  saveData();
  renderExpenses();
  updateSummary();
  expenseForm.reset();
});

function renderExpenses() {
  const tbody = document.getElementById('expense-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  expenses.forEach((ex, i) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${ex.title}</td>
      <td>₦${ex.amount.toFixed(2)}</td>
      <td>${ex.category}</td>
      <td>${ex.date}</td>
      <td>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>`;
    row.querySelector('.edit-btn').onclick = () => beginEditExpense(i);
    row.querySelector('.delete-btn').onclick = () => deleteExpense(i);
  });
}

function beginEditExpense(i) {
  const ex = expenses[i];
  document.getElementById('expense-title').value = ex.title;
  document.getElementById('expense-amount').value = ex.amount;
  document.getElementById('expense-category').value = ex.category;
  expenseForm.querySelector('button').textContent = 'Update Expense';
  editExpenseIndex = i;
}

function deleteExpense(i) {
  if (!confirm('Delete this expense entry?')) return;
  expenses.splice(i, 1);
  saveData();
  renderExpenses();
  updateSummary();
}

/* ──────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────*/
function updateSummary() {
  const totalIncome  = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const balance      = totalIncome - totalExpense;
  document.querySelector('.income').textContent = `Total Income: ₦${totalIncome.toFixed(2)}`;
  document.querySelector('.expenses').textContent = `Total Expenses: ₦${totalExpense.toFixed(2)}`;
  document.querySelector('.balance').textContent = `Remaining Balance: ₦${balance.toFixed(2)}`;
}

/* === Reset everything === */
function resetBudget(){
  if(!confirm("Clear ALL data?")) return;
  localStorage.removeItem("incomes");
  localStorage.removeItem("expenses");
  location.reload();
}
document.getElementById('reset-btn').addEventListener('click', resetBudget);

/* === Dark mode toggle === */
const toggle = document.getElementById('dark-mode-toggle');
if (toggle) {
  toggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', toggle.checked);
    localStorage.setItem('darkMode', toggle.checked);
  });
}

/* === Date grouping helper === */
function groupByMonth(items) {
  const grouped = {};
  items.forEach(item => {
    if (!item.date) return;
    const datePart = item.date.split(' ')[0]; // "DD/MM/YYYY"
    const [day, month, year] = datePart.split('/');
    const monthYear = month + '/' + year;
    if (!grouped[monthYear]) grouped[monthYear] = [];
    grouped[monthYear].push(item);
  });
  return grouped;
}

/* === Chart.js for visualizations === */
// Function to generate random color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
function renderCharts(filteredIncomes = incomes, filteredExpenses = expenses) {
  // If Chart.js not loaded yet, skip gracefully
  if (typeof Chart === 'undefined') return;

  const chartsEl = document.getElementById('charts');
  if (!chartsEl) return;

  chartsEl.innerHTML = `
    <canvas id="income-chart" width="600" height="300" style="width:100%;max-width:600px;"></canvas>
    <canvas id="expense-chart" width="600" height="300" style="width:100%;max-width:600px;"></canvas>
    <canvas id="category-chart" width="600" height="300" style="width:100%;max-width:600px;"></canvas>
  `;

  // ✅ First, group the data
  const groupedIncomes = groupByMonth(filteredIncomes);
  const groupedExpenses = groupByMonth(filteredExpenses);

  // ✅ Collect all months that appear in incomes or expenses
  const allMonths = Array.from(new Set([
    ...Object.keys(groupedIncomes),
    ...Object.keys(groupedExpenses)
  ])).sort((a, b) => {
    const [m1, y1] = a.split('/').map(Number);
    const [m2, y2] = b.split('/').map(Number);
    return y1 !== y2 ? y1 - y2 : m1 - m2;
  });

  // ✅ Income chart
  const incomeCtx = document.getElementById('income-chart').getContext('2d');
  const incomeData = allMonths.map(m => groupedIncomes[m] 
    ? groupedIncomes[m].reduce((sum, inc) => sum + inc.amount, 0) 
    : 0
  );
  new Chart(incomeCtx, {
    type: 'line',
    data: {
      labels: allMonths,
      datasets: [{
        label: 'Income Over Time',
        data: incomeData,
        borderColor: 'green',
        backgroundColor: 'lightgreen',
        fill: true,
        tension: 0.3
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  // ✅ Expense chart
  const expenseCtx = document.getElementById('expense-chart').getContext('2d');
  const expenseData = allMonths.map(m => groupedExpenses[m] 
    ? groupedExpenses[m].reduce((sum, ex) => sum + ex.amount, 0) 
    : 0
  );
  new Chart(expenseCtx, {
    type: 'line',
    data: {
      labels: allMonths,
      datasets: [{
        label: 'Expenses Over Time',
        data: expenseData,
        borderColor: 'red',
        backgroundColor: 'lightcoral',
        fill: true,
        tension: 0.3
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });


// Category pie chart
const categoryCtx = document.getElementById('category-chart').getContext('2d');
const categoryTotals = {};
filteredExpenses.forEach(ex => {
  if (!categoryTotals[ex.category]) categoryTotals[ex.category] = 0;
  categoryTotals[ex.category] += ex.amount;
});

// Generate dynamic colors for each category
const categoryLabels = Object.keys(categoryTotals);
const categoryColors = categoryLabels.map(() => getRandomColor());

new Chart(categoryCtx, {
  type: 'pie',
  data: {
    labels: categoryLabels,
    datasets: [{
      label: 'Expenses by Category',
      data: Object.values(categoryTotals),
      backgroundColor: categoryColors
    }]
  },
  options: { responsive: true }
});
}

/* === PDF export logic === */
const exportPdfBtn = document.getElementById('export-pdf-btn');
if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportPDF);

function exportPDF() {
  if (!window.jspdf) return alert('jsPDF not loaded');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Budget Tracker Report', 10, 15);
  doc.setFontSize(14);
  doc.text(document.querySelector('.income').textContent, 10, 30);
  doc.text(document.querySelector('.expenses').textContent, 10, 40);
  doc.text(document.querySelector('.balance').textContent, 10, 50);

  doc.setFontSize(16);
  doc.text('Income History', 10, 65);
  doc.setFontSize(10);
  let y = 75;
  doc.text('Source', 10, y); doc.text('Amount', 60, y); doc.text('Date', 110, y);
  y += 7;
  incomes.forEach(inc => {
    doc.text(inc.source, 10, y);
    doc.text('₦' + inc.amount.toFixed(2), 60, y);
    doc.text(inc.date, 110, y);
    y += 7;
    if (y > 270) { doc.addPage(); y = 20; }
  });

  y += 10;
  doc.setFontSize(16);
  doc.text('Expenses History', 10, y);
  y += 10;
  doc.setFontSize(10);
  doc.text('Title', 10, y); doc.text('Amount', 50, y); doc.text('Category', 90, y); doc.text('Date', 130, y);
  y += 7;
  expenses.forEach(ex => {
    doc.text(ex.title, 10, y);
    doc.text('₦' + ex.amount.toFixed(2), 50, y);
    doc.text(ex.category, 90, y);
    doc.text(ex.date, 130, y);
    y += 7;
    if (y > 270) { doc.addPage(); y = 20; }
  });

  doc.save('budget_report.pdf');
}

/* ─── Filter logic ─── */
function getUniqueYears() {
  const years = new Set();
  incomes.concat(expenses).forEach(item => {
    if (!item.date) return;
    const year = item.date.split('/')[2].split(' ')[0];
    years.add(year);
  });
  return Array.from(years).sort();
}

function populateYearDropdown() {
  const yearSelect = document.getElementById('filter-year');
  if (!yearSelect) return;
  yearSelect.innerHTML = '';
  const allOpt = document.createElement('option');
  allOpt.value = 'all';
  allOpt.textContent = 'All';
  yearSelect.appendChild(allOpt);
  getUniqueYears().forEach(year => {
    const opt = document.createElement('option');
    opt.value = year;
    opt.textContent = year;
    yearSelect.appendChild(opt);
  });
}

function filterDataWithOriginalIndex() {
  const year = document.getElementById('filter-year').value;
  const month = document.getElementById('filter-month').value;
  let filteredIncomes = incomes.map((item, idx) => ({...item, _idx: idx}));
  let filteredExpenses = expenses.map((item, idx) => ({...item, _idx: idx}));
  if (year !== 'all') {
    filteredIncomes = filteredIncomes.filter(item => item.date.split('/')[2].split(' ')[0] === year);
    filteredExpenses = filteredExpenses.filter(item => item.date.split('/')[2].split(' ')[0] === year);
  }
  if (month !== 'all') {
    filteredIncomes = filteredIncomes.filter(item => item.date.split('/')[1] === month);
    filteredExpenses = filteredExpenses.filter(item => item.date.split('/')[1] === month);
  }
  return { filteredIncomes, filteredExpenses };
}

function isCurrentMonthSelected() {
  const now = new Date();
  const selectedYear = document.getElementById('filter-year').value;
  const selectedMonth = document.getElementById('filter-month').value;
  const currentYear = String(now.getFullYear());
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  return (selectedYear === 'all' || selectedYear === currentYear) && (selectedMonth === 'all' || selectedMonth === currentMonth);
}

function renderFilteredTables() {
  const { filteredIncomes, filteredExpenses } = filterDataWithOriginalIndex();
  const isCurrent = isCurrentMonthSelected();
  // Income Table
  const incomeTbody = document.getElementById('income-table-body');
  if (incomeTbody) {
    incomeTbody.innerHTML = '';
    filteredIncomes.forEach((inc) => {
      const row = incomeTbody.insertRow();
      row.innerHTML = `
        <td>${inc.source}</td>
        <td>₦${inc.amount.toFixed(2)}</td>
        <td>${inc.date}</td>
        <td>
          <button class="edit-btn" ${isCurrent ? '' : 'disabled'}>Edit</button>
          <button class="delete-btn" ${isCurrent ? '' : 'disabled'}>Delete</button>
        </td>`;
      if (isCurrent) {
        row.querySelector('.edit-btn').onclick = () => beginEditIncome(inc._idx);
        row.querySelector('.delete-btn').onclick = () => deleteIncome(inc._idx);
      }
    });
  }
  // Expense Table
  const expenseTbody = document.getElementById('expense-table-body');
  if (expenseTbody) {
    expenseTbody.innerHTML = '';
    filteredExpenses.forEach((ex) => {
      const row = expenseTbody.insertRow();
      row.innerHTML = `
        <td>${ex.title}</td>
        <td>₦${ex.amount.toFixed(2)}</td>
        <td>${ex.category}</td>
        <td>${ex.date}</td>
        <td>
          <button class="edit-btn" ${isCurrent ? '' : 'disabled'}>Edit</button>
          <button class="delete-btn" ${isCurrent ? '' : 'disabled'}>Delete</button>
        </td>`;
      if (isCurrent) {
        row.querySelector('.edit-btn').onclick = () => beginEditExpense(ex._idx);
        row.querySelector('.delete-btn').onclick = () => deleteExpense(ex._idx);
      }
    });
  }

  // Update summary and charts
  const totalIncome = filteredIncomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;
  document.querySelector('.income').textContent = `Total Income: ₦${totalIncome.toFixed(2)}`;
  document.querySelector('.expenses').textContent = `Total Expenses: ₦${totalExpense.toFixed(2)}`;
  document.querySelector('.balance').textContent = `Remaining Balance: ₦${balance.toFixed(2)}`;
  renderCharts(filteredIncomes, filteredExpenses);
  renderMonthlySummary(filteredIncomes, filteredExpenses);
}

/* Render custom filtered tables used by search */
function renderFilteredTablesCustom(filteredIncomes, filteredExpenses) {
  const incomeTbody = document.getElementById('income-table-body');
  if (incomeTbody) {
    incomeTbody.innerHTML = '';
    filteredIncomes.forEach((inc, idx) => {
      const row = incomeTbody.insertRow();
      row.innerHTML = `
        <td>${inc.source}</td>
        <td>₦${inc.amount.toFixed(2)}</td>
        <td>${inc.date}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>`;
      row.querySelector('.edit-btn').onclick = () => beginEditIncome(inc._idx);
      row.querySelector('.delete-btn').onclick = () => deleteIncome(inc._idx);
    });
  }

  const expenseTbody = document.getElementById('expense-table-body');
  if (expenseTbody) {
    expenseTbody.innerHTML = '';
    filteredExpenses.forEach((ex, idx) => {
      const row = expenseTbody.insertRow();
      row.innerHTML = `
        <td>${ex.title}</td>
        <td>₦${ex.amount.toFixed(2)}</td>
        <td>${ex.category}</td>
        <td>${ex.date}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>`;
      row.querySelector('.edit-btn').onclick = () => beginEditExpense(ex._idx);
      row.querySelector('.delete-btn').onclick = () => deleteExpense(ex._idx);
    });
  }

  // summary + charts
  const totalIncome = filteredIncomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;
  document.querySelector('.income').textContent = `Total Income: ₦${totalIncome.toFixed(2)}`;
  document.querySelector('.expenses').textContent = `Total Expenses: ₦${totalExpense.toFixed(2)}`;
  document.querySelector('.balance').textContent = `Remaining Balance: ₦${balance.toFixed(2)}`;
  renderCharts(filteredIncomes, filteredExpenses);
  renderMonthlySummary(filteredIncomes, filteredExpenses);
}

/* --- Category Management --- */
let categories = ["Transport","Food","Data","Books","Tithe","Groceries","Savings","Rent","Entertainment","Others"];
function renderCategoryList() {
  const list = document.getElementById('category-list');
  if (!list) return;
  list.innerHTML = '';
  categories.forEach((cat, idx) => {
    const li = document.createElement('li');
    li.textContent = cat;
    li.style.display = 'inline-block';
    li.style.margin = '0 8px 8px 0';
    li.style.padding = '6px 12px';
    li.style.background = '#ffb5aa';
    li.style.borderRadius = '5px';
    li.style.color = '#500';
    li.style.fontWeight = 'bold';
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.style.marginLeft = '6px';
    editBtn.onclick = () => {
      const newName = prompt('Edit category name:', cat);
      if (newName && newName.trim()) {
        categories[idx] = newName.trim();
        renderCategoryList();
        renderCategoryDropdown();
      }
    };
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.style.marginLeft = '6px';
    delBtn.onclick = () => {
      if (confirm('Delete this category?')) {
        categories.splice(idx, 1);
        renderCategoryList();
        renderCategoryDropdown();
      }
    };
    li.appendChild(editBtn);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

document.getElementById('add-category-btn').onclick = () => {
  const val = document.getElementById('new-category').value.trim();
  if (val && !categories.includes(val)) {
    categories.push(val);
    renderCategoryList();
    renderCategoryDropdown();
    document.getElementById('new-category').value = '';
  }
};

function renderCategoryDropdown() {
  const dropdown = document.getElementById('expense-category');
  if (!dropdown) return;
  dropdown.innerHTML = '';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    dropdown.appendChild(opt);
  });
}

/* --- Search Bar Logic --- */
function searchTransactions() {
  const query = document.getElementById('search-bar').value.trim().toLowerCase();

  if (!query) {
    renderFilteredTables();
    return;
  }

  const filteredIncomes = incomes.map((item, idx) => ({...item, _idx: idx}))
    .filter(item =>
      (item.source || '').toLowerCase().includes(query) || (item.date || '').toLowerCase().includes(query)
    );

  const filteredExpenses = expenses.map((item, idx) => ({...item, _idx: idx}))
    .filter(item =>
      (item.title || '').toLowerCase().includes(query) ||
      (item.category || '').toLowerCase().includes(query) ||
      (item.date || '').toLowerCase().includes(query)
    );

  const incomeTable = document.getElementById('income-table-body');
  const expenseTable = document.getElementById('expense-table-body');

  if (filteredIncomes.length === 0 && filteredExpenses.length === 0) {
    if (incomeTable) incomeTable.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red; font-weight:bold;">No results found</td></tr>`;
    if (expenseTable) expenseTable.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red; font-weight:bold;">No results found</td></tr>`;
    document.querySelector("#income-section").scrollIntoView({ behavior: "smooth" });
    return;
  }

  renderFilteredTablesCustom(filteredIncomes, filteredExpenses);
  document.querySelector("#income-section").scrollIntoView({ behavior: "smooth" });
}

const searchBtn = document.getElementById('search-btn');
if (searchBtn) searchBtn.onclick = searchTransactions;
const searchBar = document.getElementById('search-bar');
if (searchBar) {
  searchBar.oninput = searchTransactions;
  searchBar.addEventListener('keydown', function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      searchTransactions();
    }
  });
}

/* ─── Monthly Summary ─── */
function renderMonthlySummary(filteredIncomes = incomes, filteredExpenses = expenses) {
  const groupedIncomes = groupByMonth(filteredIncomes);
  const groupedExpenses = groupByMonth(filteredExpenses);
  const months = Array.from(new Set([...Object.keys(groupedIncomes), ...Object.keys(groupedExpenses)])).sort((a,b) => {
    const [m1,y1] = a.split('/').map(Number);
    const [m2,y2] = b.split('/').map(Number);
    return y1 !== y2 ? y1 - y2 : m1 - m2;
  });
  let html = '<table style="width:100%;margin-top:10px;"><thead><tr><th>Month</th><th>Total Income</th><th>Total Expenses</th><th>Balance</th></tr></thead><tbody>';
  months.forEach(monthYear => {
    const income = groupedIncomes[monthYear]?.reduce((s, i) => s + i.amount, 0) || 0;
    const expense = groupedExpenses[monthYear]?.reduce((s, e) => s + e.amount, 0) || 0;
    const balance = income - expense;
    html += `<tr><td>${monthYear}</td><td style='color:#22c55e;'>₦${income.toFixed(2)}</td><td style='color:#ef4444;'>₦${expense.toFixed(2)}</td><td style='color:#2563eb;'>₦${balance.toFixed(2)}</td></tr>`;
  });
  html += '</tbody></table>';
  const el = document.getElementById('monthly-summary-content');
  if (el) el.innerHTML = html;
}

/* === Service Worker Registration for PWA === */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => { console.log('Service Worker registered with scope:', registration.scope); })
      .catch(error => { console.error('Service Worker registration failed:', error); });
  });
}

/* --- Filter controls listeners --- */
const fy = document.getElementById('filter-year');
const fm = document.getElementById('filter-month');
if (fy) fy.addEventListener('change', renderFilteredTables);
if (fm) fm.addEventListener('change', renderFilteredTables);

/* === Initial page setup on load === */
window.addEventListener('load', () => {
  // Turn on dark mode if previously set
  const darkMode = JSON.parse(localStorage.getItem('darkMode'));
  if (darkMode && toggle) {
    document.body.classList.add('dark-mode');
    toggle.checked = true;
  }

  // populate dropdowns, lists and render UI
  populateYearDropdown();
  renderCategoryList();
  renderCategoryDropdown();
  renderIncomes();
  renderExpenses();
  updateSummary();
  renderCharts();
  renderMonthlySummary();
  renderFilteredTables(); // show filtered results (default = all)
});
// Display current year in footer
    document.getElementById("year").textContent = new Date().getFullYear();