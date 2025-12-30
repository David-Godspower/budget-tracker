/* BUDGET TRACKER - COMPLETE LOGIC
   Features: LocalStorage, Charts, PDF, Search, Monthly Summary, Dark Mode
*/

// --- 1. Helper Functions ---

// Get current date formatted nicely (e.g., "30/12/2025 02:45 PM")
function getFormattedDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strTime = String(hours).padStart(2, '0') + ':' + minutes + ' ' + ampm;
  return `${day}/${month}/${year} ${strTime}`;
}

// Format number to Nigerian Naira (e.g., ₦50,000.00)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(amount);
};

// Group data by Month/Year for charts/summary
function groupByMonth(items) {
  const grouped = {};
  items.forEach(item => {
    if (!item.date) return;
    const datePart = item.date.split(' ')[0]; // Extract DD/MM/YYYY
    const [day, month, year] = datePart.split('/');
    const monthYear = month + '/' + year;
    if (!grouped[monthYear]) grouped[monthYear] = [];
    grouped[monthYear].push(item);
  });
  return grouped;
}

// --- 2. State Management ---

const incomeForm = document.getElementById('income-form');
const expenseForm = document.getElementById('expense-form');
let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let categories = ["Transport","Food","Data","Books","Tithe","Groceries","Savings","Rent","Entertainment","Others"];

let editIncomeIndex = null;
let editExpenseIndex = null;

// --- 3. Core Functions ---

function saveData() {
  localStorage.setItem('incomes', JSON.stringify(incomes));
  localStorage.setItem('expenses', JSON.stringify(expenses));
  
  // Refresh all visuals
  updateSummary();
  renderCharts();
  renderMonthlySummary();
}

// --- 4. Income Logic ---

incomeForm.addEventListener('submit', e => {
  e.preventDefault();
  const source = document.getElementById('income-source').value.toUpperCase().trim();
  const amount = parseFloat(document.getElementById('income-amount').value);

  if (!source || isNaN(amount) || amount <= 0) return alert("Please enter a valid amount");

  const entry = { source, amount, date: getFormattedDate() };

  if (editIncomeIndex !== null) {
    incomes[editIncomeIndex] = entry;
    editIncomeIndex = null;
    incomeForm.querySelector('button').textContent = 'Add Income';
  } else {
    incomes.push(entry);
  }

  saveData();
  renderIncomes(); // Refresh table
  incomeForm.reset();
});

function renderIncomes(data = incomes) {
  const tbody = document.getElementById('income-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  if(data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888;">No income records found</td></tr>`;
      return;
  }

  data.forEach((inc, index) => {
    // Find original index if we are viewing filtered results
    const originalIndex = incomes.indexOf(inc); 
    
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${inc.source}</td>
      <td>${formatCurrency(inc.amount)}</td>
      <td>${inc.date}</td>
      <td>
        <button class="edit-btn" onclick="beginEditIncome(${originalIndex})">Edit</button>
        <button class="delete-btn" onclick="deleteIncome(${originalIndex})">Delete</button>
      </td>`;
  });
}

// Window functions for HTML onclick attributes
window.beginEditIncome = (i) => {
  const inc = incomes[i];
  document.getElementById('income-source').value = inc.source;
  document.getElementById('income-amount').value = inc.amount;
  incomeForm.querySelector('button').textContent = 'Update Income';
  editIncomeIndex = i;
  document.getElementById('income-section').scrollIntoView({ behavior: 'smooth' });
};

window.deleteIncome = (i) => {
  if (!confirm('Delete this income entry?')) return;
  incomes.splice(i, 1);
  saveData();
  renderIncomes();
};

// --- 5. Expense Logic ---

expenseForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('expense-title').value.toUpperCase().trim();
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const category = document.getElementById('expense-category').value;

  if (!title || isNaN(amount) || amount <= 0) return alert("Please enter a valid amount");

  const entry = { title, amount, category, date: getFormattedDate() };

  if (editExpenseIndex !== null) {
    expenses[editExpenseIndex] = entry;
    editExpenseIndex = null;
    expenseForm.querySelector('button').textContent = 'Add Expense';
  } else {
    expenses.push(entry);
  }

  saveData();
  renderExpenses(); // Refresh table
  expenseForm.reset();
});

function renderExpenses(data = expenses) {
  const tbody = document.getElementById('expense-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  if(data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888;">No expense records found</td></tr>`;
      return;
  }

  data.forEach((ex, index) => {
    const originalIndex = expenses.indexOf(ex);
    
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${ex.title}</td>
      <td>${formatCurrency(ex.amount)}</td>
      <td>${ex.category}</td>
      <td>${ex.date}</td>
      <td>
        <button class="edit-btn" onclick="beginEditExpense(${originalIndex})">Edit</button>
        <button class="delete-btn" onclick="deleteExpense(${originalIndex})">Delete</button>
      </td>`;
  });
}

window.beginEditExpense = (i) => {
  const ex = expenses[i];
  document.getElementById('expense-title').value = ex.title;
  document.getElementById('expense-amount').value = ex.amount;
  document.getElementById('expense-category').value = ex.category;
  expenseForm.querySelector('button').textContent = 'Update Expense';
  editExpenseIndex = i;
  document.getElementById('expenses-section').scrollIntoView({ behavior: 'smooth' });
};

window.deleteExpense = (i) => {
  if (!confirm('Delete this expense entry?')) return;
  expenses.splice(i, 1);
  saveData();
  renderExpenses();
};

// --- 6. Summary & Analysis ---

function updateSummary() {
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  document.querySelector('.income').textContent = `Total Income: ${formatCurrency(totalIncome)}`;
  document.querySelector('.expenses').textContent = `Total Expenses: ${formatCurrency(totalExpense)}`;
  document.querySelector('.balance').textContent = `Remaining Balance: ${formatCurrency(balance)}`;
}

function renderMonthlySummary() {
  const groupedIncomes = groupByMonth(incomes);
  const groupedExpenses = groupByMonth(expenses);
  
  const months = Array.from(new Set([
    ...Object.keys(groupedIncomes),
    ...Object.keys(groupedExpenses)
  ])).sort((a, b) => {
    const [m1, y1] = a.split('/').map(Number);
    const [m2, y2] = b.split('/').map(Number);
    return y1 !== y2 ? y1 - y2 : m1 - m2;
  });

  let html = `
    <table style="width:100%; margin-top:10px;">
      <thead>
        <tr><th>Month</th><th>Income</th><th>Expenses</th><th>Balance</th></tr>
      </thead>
      <tbody>`;

  if(months.length === 0) {
     html += `<tr><td colspan="4" style="text-align:center;">No data available</td></tr>`;
  }

  months.forEach(monthYear => {
    const income = groupedIncomes[monthYear]?.reduce((s, i) => s + i.amount, 0) || 0;
    const expense = groupedExpenses[monthYear]?.reduce((s, e) => s + e.amount, 0) || 0;
    const balance = income - expense;
    html += `
      <tr>
        <td>${monthYear}</td>
        <td style="color:#22c55e;">${formatCurrency(income)}</td>
        <td style="color:#ef4444;">${formatCurrency(expense)}</td>
        <td style="color:${balance >= 0 ? '#2563eb' : '#dc2626'}; font-weight:bold;">${formatCurrency(balance)}</td>
      </tr>`;
  });
  html += '</tbody></table>';
  
  const el = document.getElementById('monthly-summary-content');
  if (el) el.innerHTML = html;
}

// --- 7. Charts ---

function renderCharts() {
  if (typeof Chart === 'undefined') return;

  const chartsEl = document.getElementById('charts');
  if (!chartsEl) return;
  
  // Reset Canvas to prevent glitches
  chartsEl.innerHTML = `
    <canvas id="income-chart" style="width:100%;max-width:600px; margin-bottom:20px;"></canvas>
    <canvas id="expense-chart" style="width:100%;max-width:600px; margin-bottom:20px;"></canvas>
    <canvas id="category-chart" style="width:100%;max-width:600px;"></canvas>
  `;

  const groupedIncomes = groupByMonth(incomes);
  const groupedExpenses = groupByMonth(expenses);
  const allMonths = Array.from(new Set([...Object.keys(groupedIncomes), ...Object.keys(groupedExpenses)]));
  
  // Sort months
  allMonths.sort((a, b) => {
      const [m1, y1] = a.split('/').map(Number);
      const [m2, y2] = b.split('/').map(Number);
      return y1 !== y2 ? y1 - y2 : m1 - m2;
  });

  const incomeData = allMonths.map(m => groupedIncomes[m] ? groupedIncomes[m].reduce((sum, i) => sum + i.amount, 0) : 0);
  const expenseData = allMonths.map(m => groupedExpenses[m] ? groupedExpenses[m].reduce((sum, e) => sum + e.amount, 0) : 0);

  new Chart(document.getElementById('income-chart'), {
    type: 'line',
    data: {
      labels: allMonths,
      datasets: [{ label: 'Income', data: incomeData, borderColor: '#22c55e', backgroundColor: '#dcfce7', fill: true }]
    }
  });

  new Chart(document.getElementById('expense-chart'), {
    type: 'line',
    data: {
      labels: allMonths,
      datasets: [{ label: 'Expenses', data: expenseData, borderColor: '#ef4444', backgroundColor: '#fee2e2', fill: true }]
    }
  });

  // Pie Chart
  const catTotals = {};
  expenses.forEach(ex => catTotals[ex.category] = (catTotals[ex.category] || 0) + ex.amount);
  
  new Chart(document.getElementById('category-chart'), {
    type: 'pie',
    data: {
      labels: Object.keys(catTotals),
      datasets: [{
        data: Object.values(catTotals),
        backgroundColor: ['#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#06b6d4','#3b82f6','#6366f1','#a855f7']
      }]
    }
  });
}

// --- 8. Category Management ---

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

function renderCategoryList() {
  const list = document.getElementById('category-list');
  if (!list) return;
  list.innerHTML = '';
  categories.forEach((cat, idx) => {
    const li = document.createElement('li');
    li.textContent = cat;
    li.style.cursor = "pointer";
    li.title = "Click to remove";
    
    // Allow deletion of categories
    li.onclick = () => {
        if(confirm(`Remove category "${cat}"?`)) {
            categories.splice(idx, 1);
            renderCategoryList();
            renderCategoryDropdown();
        }
    }
    list.appendChild(li);
  });
}

const addCatBtn = document.getElementById('add-category-btn');
if(addCatBtn) {
    addCatBtn.onclick = () => {
      const val = document.getElementById('new-category').value.trim();
      if (val && !categories.includes(val)) {
        categories.push(val);
        renderCategoryList();
        renderCategoryDropdown();
        document.getElementById('new-category').value = '';
      }
    };
}

// --- 9. Search & Filter ---

function populateYearDropdown() {
    const years = new Set();
    [...incomes, ...expenses].forEach(item => {
        if(item.date) years.add(item.date.split('/')[2].split(' ')[0]);
    });
    const select = document.getElementById('filter-year');
    if(!select) return;
    select.innerHTML = '<option value="all">All</option>';
    Array.from(years).sort().forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        select.appendChild(opt);
    });
}

document.getElementById('filter-btn').addEventListener('click', () => {
    const year = document.getElementById('filter-year').value;
    const month = document.getElementById('filter-month').value;
    
    let filteredIncomes = incomes;
    let filteredExpenses = expenses;

    if (year !== 'all') {
        filteredIncomes = filteredIncomes.filter(i => i.date.includes(`/${year} `));
        filteredExpenses = filteredExpenses.filter(e => e.date.includes(`/${year} `));
    }
    if (month !== 'all') {
        filteredIncomes = filteredIncomes.filter(i => i.date.split('/')[1] === month);
        filteredExpenses = filteredExpenses.filter(e => e.date.split('/')[1] === month);
    }

    renderIncomes(filteredIncomes);
    renderExpenses(filteredExpenses);
});


// --- 9. Search & Filter ---

function populateYearDropdown() {
    const years = new Set();
    [...incomes, ...expenses].forEach(item => {
        if(item.date) years.add(item.date.split('/')[2].split(' ')[0]);
    });
    const select = document.getElementById('filter-year');
    if(!select) return;
    select.innerHTML = '<option value="all">All</option>';
    Array.from(years).sort().forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        select.appendChild(opt);
    });
}

// 1. FILTER BUTTON LOGIC (Now with Auto-Scroll)
document.getElementById('filter-btn').addEventListener('click', () => {
    const year = document.getElementById('filter-year').value;
    const month = document.getElementById('filter-month').value;
    
    let filteredIncomes = incomes;
    let filteredExpenses = expenses;

    // Apply Logic
    if (year !== 'all') {
        filteredIncomes = filteredIncomes.filter(i => i.date.includes(`/${year} `));
        filteredExpenses = filteredExpenses.filter(e => e.date.includes(`/${year} `));
    }
    if (month !== 'all') {
        filteredIncomes = filteredIncomes.filter(i => i.date.split('/')[1] === month);
        filteredExpenses = filteredExpenses.filter(e => e.date.split('/')[1] === month);
    }

    // Render Tables
    renderIncomes(filteredIncomes);
    renderExpenses(filteredExpenses);

    // AUTO-SCROLL: Take user to the results
    const resultsArea = document.getElementById('income-section');
    if(resultsArea) {
        resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

// 2. SEARCH BAR LOGIC (With Auto-Scroll)
const searchBar = document.getElementById('search-bar');
const searchBtn = document.getElementById('search-btn');

function performSearch() {
    const query = searchBar.value.toLowerCase().trim();
    
    const filteredIncomes = incomes.filter(i => 
        i.source.toLowerCase().includes(query) || i.date.includes(query)
    );
    const filteredExpenses = expenses.filter(e => 
        e.title.toLowerCase().includes(query) || e.category.toLowerCase().includes(query) || e.date.includes(query)
    );

    renderIncomes(filteredIncomes);
    renderExpenses(filteredExpenses);

    // AUTO-SCROLL: Take user to the results
    const resultsArea = document.getElementById('income-section');
    if(resultsArea) {
        resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

if(searchBtn) searchBtn.addEventListener('click', performSearch);
if(searchBar) {
    searchBar.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') performSearch();
    });
}

// --- 10. PDF Export ---

document.getElementById('export-pdf-btn').addEventListener('click', () => {
  if (!window.jspdf) return alert('jsPDF library not loaded. Check internet connection.');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('Budget Tracker Report', 10, 20);
  
  doc.setFontSize(12);
  const now = new Date();
  doc.text(`Generated on: ${now.toDateString()}`, 10, 30);

  let y = 40;
  
  // Summary
  doc.setFontSize(14);
  doc.setTextColor(34, 197, 94); // Green
  doc.text(document.querySelector('.income').textContent, 10, y);
  y += 10;
  doc.setTextColor(239, 68, 68); // Red
  doc.text(document.querySelector('.expenses').textContent, 10, y);
  y += 10;
  doc.setTextColor(37, 99, 235); // Blue
  doc.text(document.querySelector('.balance').textContent, 10, y);
  y += 20;

  doc.setTextColor(0, 0, 0); // Black
  doc.setFontSize(16);
  doc.text("Latest Transactions", 10, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.text("Type", 10, y);
  doc.text("Description", 40, y);
  doc.text("Amount", 120, y);
  doc.text("Date", 160, y);
  y += 10;

  // Combine and sort last 15 transactions
  const combined = [
      ...incomes.map(i => ({...i, type: "Income"})),
      ...expenses.map(e => ({...e, type: "Expense", title: e.title}))
  ].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 20);

  combined.forEach(item => {
      const desc = item.source || item.title;
      doc.text(item.type, 10, y);
      doc.text(desc.substring(0, 30), 40, y);
      doc.text(formatCurrency(item.amount), 120, y);
      doc.text(item.date, 160, y);
      y += 8;
      if (y >= 280) { doc.addPage(); y = 20; }
  });

  doc.save('Budget_Statement.pdf');
});

// Reset Button
document.getElementById('reset-btn').addEventListener('click', () => {
    if(confirm("Are you sure? This will delete ALL data.")) {
        localStorage.clear();
        location.reload();
    }
});

// --- 11. Initialization ---

window.addEventListener('load', () => {
    // Dark Mode
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
        if(JSON.parse(localStorage.getItem('darkMode'))) {
            document.body.classList.add('dark-mode');
            toggle.checked = true;
        }
        toggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', toggle.checked);
            localStorage.setItem('darkMode', toggle.checked);
        });
    }

    // Render Everything
    renderCategoryDropdown();
    renderCategoryList();
    renderIncomes();
    renderExpenses();
    updateSummary();
    renderCharts();
    renderMonthlySummary();
    populateYearDropdown();

    // Copyright Year
    const yearEl = document.getElementById("year");
    if(yearEl) yearEl.textContent = new Date().getFullYear();
});