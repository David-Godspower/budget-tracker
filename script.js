/* ─── Persistent state ─── */
// Helper to get formatted date as DD/MM/YYYY HH:MM
function getFormattedDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
const incomeForm = document.getElementById('income-form');
const expenseForm = document.getElementById('expense-form');
let incomes  = JSON.parse(localStorage.getItem('incomes'))  || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

let editIncomeIndex  = null;
let editExpenseIndex = null;

function saveData() {
  localStorage.setItem('incomes',  JSON.stringify(incomes));
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

incomeForm.addEventListener('submit', e => {
  e.preventDefault();
  const source = document.getElementById('income-source').value.trim();
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

expenseForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('expense-title').value.trim();
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

function updateSummary() {
  const totalIncome  = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const balance      = totalIncome - totalExpense;
  document.querySelector('.income').textContent = `Total Income: ₦${totalIncome.toFixed(2)}`;
  document.querySelector('.expenses').textContent = `Total Expenses: ₦${totalExpense.toFixed(2)}`;
  document.querySelector('.balance').textContent = `Remaining Balance: ₦${balance.toFixed(2)}`;
}

renderIncomes();
renderExpenses();
updateSummary();
populateYearDropdown();


function groupByMonth(items) {
  // Groups items by month/year string (MM/YYYY)
  const grouped = {};
  items.forEach(item => {
    if (!item.date) return;
    const datePart = item.date.split(' ')[0]; // "07/09/2025"
    const [day, month, year] = datePart.split('/');
    const monthYear = month + '/' + year;
    if (!grouped[monthYear]) grouped[monthYear] = [];
    grouped[monthYear].push(item);
  });
  return grouped;
}


/* ──────────────────────────────────────────────────────────
   INCOME: add / edit / delete
   ──────────────────────────────────────────────────────────*/
// ...existing code...
// Restore flat array logic for incomes
incomeForm.addEventListener('submit', e => {
  e.preventDefault();
  const source = document.getElementById('income-source').value.trim();
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
// ...existing code...
// Restore flat array logic for expenses
expenseForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('expense-title').value.trim();
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
function saveData() {
  localStorage.setItem('incomes', JSON.stringify(incomes));
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

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

    // Display current year in footer
    document.getElementById("year").textContent = new Date().getFullYear();

/* === Export data as JSON === */
function exportData() {
  const data = { incomes: incomesByMonth, expenses: expensesByMonth };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'budget_data.json';
  a.click();
  URL.revokeObjectURL(url);
}

/* === Import data from JSON === */
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const contents = e.target.result;
    try {
      const data = JSON.parse(contents);
      // Validate and set the imported data
      if (Array.isArray(data.incomes) && Array.isArray(data.expenses)) {
        incomes = data.incomes;
        expenses = data.expenses;
        saveData();
        renderIncomes();
        renderExpenses();
        updateSummary();
      } else {
        alert('Invalid data format.');
      }
    } catch (error) {
      alert('Error reading file.');
    }
  };
  reader.readAsText(file);
}

document.getElementById('import-file').addEventListener('change', importData);
document.getElementById('export-btn').addEventListener('click', exportData);
document.getElementById('reset-btn').addEventListener('click', resetBudget);

/* === Dark mode toggle === */
const toggle = document.getElementById('dark-mode-toggle');
toggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode', toggle.checked);
  localStorage.setItem('darkMode', toggle.checked);
});

// On page load, set the toggle based on saved preference
window.addEventListener('load', () => {
  // Clear old grouped-by-month data if present
  if (localStorage.getItem('incomesByMonth') || localStorage.getItem('expensesByMonth')) {
    localStorage.removeItem('incomesByMonth');
    localStorage.removeItem('expensesByMonth');
    localStorage.removeItem('incomes');
    localStorage.removeItem('expenses');
    location.reload();
    return;
  }
  const darkMode = JSON.parse(localStorage.getItem('darkMode'));
  if (darkMode) {
    document.body.classList.add('dark-mode');
    toggle.checked = true;
  }
});

/* === Chart.js for visualizations === */
function renderCharts(filteredIncomes = incomes, filteredExpenses = expenses) {
  // Clear existing canvases if any
  document.getElementById('charts').innerHTML = `
    <canvas id="income-chart" width="600" height="300" style="width:100%;max-width:600px;"></canvas>
    <canvas id="expense-chart" width="600" height="300" style="width:100%;max-width:600px;"></canvas>
    <canvas id="category-chart" width="600" height="300" style="width:100%;max-width:600px;"></canvas>
  `;
  
  // Income over time (monthly) line chart
  const incomeCtx = document.getElementById('income-chart').getContext('2d');
  const groupedIncomes = groupByMonth(filteredIncomes);
  const incomeLabels = Object.keys(groupedIncomes).sort((a,b) => {
    const [m1,y1] = a.split('/').map(Number);
    const [m2,y2] = b.split('/').map(Number);
    return y1 !== y2 ? y1 - y2 : m1 - m2;
  });
  const incomeData = incomeLabels.map(m => 
    groupedIncomes[m].reduce((sum, inc) => sum + inc.amount, 0)
  );
  
  new Chart(incomeCtx, {
    type: 'line',
    data: {
      labels: incomeLabels,
      datasets: [{
        label: 'Income Over Time',
        data: incomeData,
        borderColor: 'green',
        backgroundColor: 'lightgreen',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // Expense over time (monthly) line chart
  const expenseCtx = document.getElementById('expense-chart').getContext('2d');
  const groupedExpenses = groupByMonth(filteredExpenses);
  const expenseLabels = Object.keys(groupedExpenses).sort((a,b) => {
    const [m1,y1] = a.split('/').map(Number);
    const [m2,y2] = b.split('/').map(Number);
    return y1 !== y2 ? y1 - y2 : m1 - m2;
  });
  const expenseData = expenseLabels.map(m => 
    groupedExpenses[m].reduce((sum, ex) => sum + ex.amount, 0)
  );
  
  new Chart(expenseCtx, {
    type: 'line',
    data: {
      labels: expenseLabels,
      datasets: [{
        label: 'Expenses Over Time',
        data: expenseData,
        borderColor: 'red',
        backgroundColor: 'lightcoral',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // Expense by category pie chart
  const categoryCtx = document.getElementById('category-chart').getContext('2d');
  const categoryTotals = {};
  filteredExpenses.forEach(ex => {
    if (!categoryTotals[ex.category]) {
      categoryTotals[ex.category] = 0;
    }
    categoryTotals[ex.category] += ex.amount;
  });
  
  new Chart(categoryCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        label: 'Expenses by Category',
        data: Object.values(categoryTotals),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ]
      }]
    },
    options: {
      responsive: true
    }
  });
}

// Initial chart render
renderCharts();

// Re-render charts on data changes
const originalSaveData = saveData;
saveData = function() {
  originalSaveData();
  renderCharts();
};

const groupedExpenses = groupByMonth(expenses);
console.log(groupedExpenses);

const groupedIncomes = groupByMonth(incomes);
console.log(groupedIncomes);

/* === PDF export logic === */
document.getElementById('export-pdf-btn').addEventListener('click', exportPDF);

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Budget Tracker Report', 10, 15);

  // Add summary
  doc.setFontSize(14);
  doc.text(document.querySelector('.income').textContent, 10, 30);
  doc.text(document.querySelector('.expenses').textContent, 10, 40);
  doc.text(document.querySelector('.balance').textContent, 10, 50);

  // Add Income Table
  doc.setFontSize(16);
  doc.text('Income History', 10, 65);
  doc.setFontSize(10);
  let y = 75;
  doc.text('Source', 10, y);
  doc.text('Amount', 60, y);
  doc.text('Date', 110, y);
  y += 7;
  incomes.forEach(inc => {
    doc.text(inc.source, 10, y);
    doc.text('₦' + inc.amount.toFixed(2), 60, y);
    doc.text(inc.date, 110, y);
    y += 7;
    if (y > 270) { doc.addPage(); y = 20; }
  });

  // Add Expense Table
  y += 10;
  doc.setFontSize(16);
  doc.text('Expenses History', 10, y);
  y += 10;
  doc.setFontSize(10);
  doc.text('Title', 10, y);
  doc.text('Amount', 50, y);
  doc.text('Category', 90, y);
  doc.text('Date', 130, y);
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
    const year = item.date.split('/')[2].split(' ')[0];
    years.add(year);
  });
  return Array.from(years).sort();
}

function populateYearDropdown() {
  const yearSelect = document.getElementById('filter-year');
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
  // Expense Table
  const expenseTbody = document.getElementById('expense-table-body');
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
  // Update summary
  const totalIncome = filteredIncomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;
  document.querySelector('.income').textContent = `Total Income: ₦${totalIncome.toFixed(2)}`;
  document.querySelector('.expenses').textContent = `Total Expenses: ₦${totalExpense.toFixed(2)}`;
  document.querySelector('.balance').textContent = `Remaining Balance: ₦${balance.toFixed(2)}`;
  // Update charts with filtered data
  renderCharts(filteredIncomes, filteredExpenses);
  // Update monthly summary
  renderMonthlySummary(filteredIncomes, filteredExpenses);
}

function renderFilteredTablesCustom(filteredIncomes, filteredExpenses) {
  // Income Table
  const incomeTbody = document.getElementById('income-table-body');
  incomeTbody.innerHTML = '';
  let firstIncomeRow = null;
  filteredIncomes.forEach((inc, idx) => {
    const row = incomeTbody.insertRow();
    if (idx === 0) firstIncomeRow = row;
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
  // Expense Table
  const expenseTbody = document.getElementById('expense-table-body');
  expenseTbody.innerHTML = '';
  let firstExpenseRow = null;
  filteredExpenses.forEach((ex, idx) => {
    const row = expenseTbody.insertRow();
    if (idx === 0) firstExpenseRow = row;
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
  // Update summary
  const totalIncome = filteredIncomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;
  document.querySelector('.income').textContent = `Total Income: ₦${totalIncome.toFixed(2)}`;
  document.querySelector('.expenses').textContent = `Total Expenses: ₦${totalExpense.toFixed(2)}`;
  document.querySelector('.balance').textContent = `Remaining Balance: ₦${balance.toFixed(2)}`;
  // Update charts with filtered data
  renderCharts(filteredIncomes, filteredExpenses);
  renderMonthlySummary(filteredIncomes, filteredExpenses);
}
window.addEventListener('load', () => {
  populateYearDropdown();
  renderMonthlySummary();
});

// Category Management Logic
let categories = [
  "Transport", "Food", "Data", "Books", "Tithe", "Groceries", "Savings", "Rent", "Entertainment", "Others"
];
function renderCategoryList() {
  const list = document.getElementById('category-list');
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
    // Edit button
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
    // Delete button
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
  dropdown.innerHTML = '';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    dropdown.appendChild(opt);
  });
}
window.addEventListener('load', () => {
  renderCategoryList();
  renderCategoryDropdown();
});

// Search Bar Logic
function searchTransactions() {
  const query = document.getElementById('search-bar').value.trim().toLowerCase();
  if (!query) {
    renderFilteredTables();
    return;
  }
  // Search incomes and expenses
  const filteredIncomes = incomes.map((item, idx) => ({...item, _idx: idx})).filter(item =>
    item.source.toLowerCase().includes(query) || item.date.toLowerCase().includes(query)
  );
  const filteredExpenses = expenses.map((item, idx) => ({...item, _idx: idx})).filter(item =>
    item.title.toLowerCase().includes(query) || item.category.toLowerCase().includes(query) || item.date.toLowerCase().includes(query)
  );
  renderFilteredTablesCustom(filteredIncomes, filteredExpenses);
}

document.getElementById('search-btn').onclick = searchTransactions;
document.getElementById('search-bar').oninput = searchTransactions;

function renderFilteredTablesCustom(filteredIncomes, filteredExpenses) {
  // Income Table
  const incomeTbody = document.getElementById('income-table-body');
  incomeTbody.innerHTML = '';
  let firstIncomeRow = null;
  filteredIncomes.forEach((inc, idx) => {
    const row = incomeTbody.insertRow();
    if (idx === 0) firstIncomeRow = row;
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
  // Expense Table
  const expenseTbody = document.getElementById('expense-table-body');
  expenseTbody.innerHTML = '';
  let firstExpenseRow = null;
  filteredExpenses.forEach((ex, idx) => {
    const row = expenseTbody.insertRow();
    if (idx === 0) firstExpenseRow = row;
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
  // Update summary
  const totalIncome = filteredIncomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;
  document.querySelector('.income').textContent = `Total Income: ₦${totalIncome.toFixed(2)}`;
  document.querySelector('.expenses').textContent = `Total Expenses: ₦${totalExpense.toFixed(2)}`;
  document.querySelector('.balance').textContent = `Remaining Balance: ₦${balance.toFixed(2)}`;
  // Update charts with filtered data
  renderCharts(filteredIncomes, filteredExpenses);
  renderMonthlySummary(filteredIncomes, filteredExpenses);
}

/* ─── Monthly Summary ─── */
function renderMonthlySummary(filteredIncomes = incomes, filteredExpenses = expenses) {
  // Group by month/year
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
  document.getElementById('monthly-summary-content').innerHTML = html;
}

/* === Service Worker Registration for PWA === */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}


