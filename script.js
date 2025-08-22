
/* ─── Persistent state ─── */
let incomes  = JSON.parse(localStorage.getItem('incomes'))  || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

let editIncomeIndex  = null;   // ← index being edited, or null
let editExpenseIndex = null;


// Get formatted date and time
function getFormattedDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2,'0');
  const month = String(now.getMonth()+1).padStart(2,'0');
  const year = now.getFullYear();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2,'0');
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}

/* ─── Form references ─── */
const incomeForm  = document.getElementById('income-form');
const expenseForm = document.getElementById('expense-form');

/* ─── Initial render ─── */
renderIncomes();
renderExpenses();
updateSummary();

/* ──────────────────────────────────────────────────────────
   INCOME: add / edit / delete
   ──────────────────────────────────────────────────────────*/
incomeForm.addEventListener('submit', e => {
  e.preventDefault();

  const source = document.getElementById('income-source').value.trim();
  const amount = parseFloat(document.getElementById('income-amount').value);
  if (!source || isNaN(amount)) return;

  const entry = { source, amount, date: new Date().toLocaleDateString() };

  if (editIncomeIndex !== null) {
    // update existing
    incomes[editIncomeIndex] = entry;
    editIncomeIndex = null;
    incomeForm.querySelector('button').textContent = 'Add Income';
  } else {
    // add new
    incomes.push(entry);
  }

  saveData();
  renderIncomes();
  updateSummary();
  incomeForm.reset();
});

function renderIncomes() {
  const tbody = document.getElementById('income-table-body');
  if (!tbody) return;  // user may not have the table in markup
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
    row.querySelector('.edit-btn'  ).onclick = () => beginEditIncome(i);
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

  const title    = document.getElementById('expense-title').value.trim();
  const amount   = parseFloat(document.getElementById('expense-amount').value);
  const category = document.getElementById('expense-category').value;
  if (!title || isNaN(amount)) return;

  const entry = { title, amount, category, date:  getFormattedDate() };

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
    row.querySelector('.edit-btn'  ).onclick = () => beginEditExpense(i);
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
  localStorage.setItem('incomes',  JSON.stringify(incomes));
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function updateSummary() {
  const totalIncome  = incomes .reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const balance      = totalIncome - totalExpense;

  document.querySelector('.income'  ).textContent = `Total Income: ₦${totalIncome.toFixed(2)}`;
  document.querySelector('.expenses').textContent = `Total Expenses: ₦${totalExpense.toFixed(2)}`;
  document.querySelector('.balance' ).textContent = `Remaining Balance: ₦${balance.toFixed(2)}`;
}

 /* === Reset everything === */
    function resetBudget(){
      if(!confirm("Clear ALL data?")) return;
      localStorage.removeItem("incomes");
      localStorage.removeItem("expenses");
      location.reload();
    }