document.addEventListener("DOMContentLoaded", () => {
  // --- State Management ---
  let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let categories = [
    "Transport",
    "Food",
    "Data",
    "Books",
    "Tithe",
    "Groceries",
    "Savings",
    "Rent",
    "Entertainment",
    "Others",
  ];

  let lineChart, pieChart; // Scoped outside to allow .destroy()

  const elements = {
    incomeForm: document.getElementById("income-form"),
    expenseForm: document.getElementById("expense-form"),
    historyTable: document.getElementById("transaction-history"),
    searchBar: document.getElementById("search-bar"),
    categorySelect: document.getElementById("expense-category"),
    loader: document.getElementById("loader"),
    themeToggle: document.getElementById("dark-mode-toggle"),
    summary: {
      income: document.getElementById("total-income"),
      expense: document.getElementById("total-expenses"),
      balance: document.getElementById("total-balance"),
    },
  };

  // --- 1. Initialization ---
  const init = () => {
    setupTheme();
    renderCategoryDropdown();
    updateDashboard();
    hideLoader();
  };

  const hideLoader = () => {
    setTimeout(() => {
      elements.loader.style.opacity = "0";
      setTimeout(() => (elements.loader.style.display = "none"), 500);
    }, 1000);
  };

  // --- 2. Core Dashboard Logic ---
  const updateDashboard = (query = "") => {
    saveToLocalStorage();
    calculateSummary();
    renderTransactions(query);
    renderCharts();
  };

  const saveToLocalStorage = () => {
    localStorage.setItem("incomes", JSON.stringify(incomes));
    localStorage.setItem("expenses", JSON.stringify(expenses));
  };

  const calculateSummary = () => {
    const totalInc = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalInc - totalExp;

    elements.summary.income.innerText = formatCurrency(totalInc);
    elements.summary.expense.innerText = formatCurrency(totalExp);
    elements.summary.balance.innerText = formatCurrency(balance);
    elements.summary.balance.style.color =
      balance < 0 ? "var(--expense)" : "var(--accent)";
  };

  // --- 3. Unified Transaction Stream ---
  const renderTransactions = (query = "") => {
    elements.historyTable.innerHTML = "";
    const allTransactions = [
      ...incomes.map((i) => ({
        ...i,
        type: "Income",
        color: "#10b981",
        icon: "fa-arrow-down",
      })),
      ...expenses.map((e) => ({
        ...e,
        type: "Expense",
        color: "#f43f5e",
        icon: "fa-arrow-up",
      })),
    ].sort((a, b) => new Date(parseDate(b.date)) - new Date(parseDate(a.date)));

    const filtered = allTransactions.filter(
      (t) =>
        (t.source || t.title).toLowerCase().includes(query.toLowerCase()) ||
        (t.category || "").toLowerCase().includes(query.toLowerCase()),
    );

    if (filtered.length === 0) {
      elements.historyTable.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--text-muted)">No transactions found.</td></tr>`;
      return;
    }

    filtered.forEach((t) => {
      const row = elements.historyTable.insertRow();
      row.className = "reveal";
      row.innerHTML = `
                <td><span class="badge" style="background:${t.color}15; color:${t.color}"><i class="fas ${t.icon}" style="font-size:0.7rem"></i> ${t.type}</span></td>
                <td style="font-weight:600">${t.source || t.title}</td>
                <td><span class="cat-pill">${t.category || "—"}</span></td>
                <td style="color:${t.color}; font-weight:700">${formatCurrency(t.amount)}</td>
                <td style="color:var(--text-muted); font-size:0.85rem">${t.date}</td>
                <td><button class="btn-action" onclick="deleteEntry('${t.date}', '${t.type}')"><i class="fas fa-trash-alt"></i></button></td>`;
    });
  };

  // --- 4. Forms & Tabs ---
  elements.incomeForm.onsubmit = (e) => {
    e.preventDefault();
    incomes.push({
      source: document.getElementById("income-source").value.trim(),
      amount: parseFloat(document.getElementById("income-amount").value),
      date: getFormattedDate(),
    });
    elements.incomeForm.reset();
    updateDashboard();
  };

  elements.expenseForm.onsubmit = (e) => {
    e.preventDefault();
    expenses.push({
      title: document.getElementById("expense-title").value.trim(),
      amount: parseFloat(document.getElementById("expense-amount").value),
      category: elements.categorySelect.value,
      date: getFormattedDate(),
    });
    elements.expenseForm.reset();
    updateDashboard();
  };
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.onclick = () => {
      // Remove 'active' class from all buttons
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));

      // Add 'active' to clicked button
      btn.classList.add("active");

      // Hide all forms and show targeted one
      document
        .querySelectorAll(".entry-form")
        .forEach((f) => f.classList.add("hidden"));
      const targetForm = document.getElementById(btn.dataset.target);
      targetForm.classList.remove("hidden");

      // Update the submit button text dynamically
      const submitBtn = targetForm.querySelector(".btn-submit");
      if (btn.dataset.target === "income-form") {
        submitBtn.innerText = "Add Income";
      } else {
        submitBtn.innerText = "Add Expense";
      }
    };
  });

  document.getElementById("export-pdf-btn").onclick = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 1. Branding & Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Your primary blue
    doc.text("BudgetTracker Financial Report", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(`Developer: David Godspower Ajala`, 14, 30); // Professional signature
    doc.text(`Statement Period: ${new Date().toLocaleDateString()}`, 14, 35);

    // 2. Summary Boxes (Drawing simple rectangles for structure)
    const totalInc = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
    const balance = totalInc - totalExp;

    doc.setFillColor(248, 250, 252); // Light background for summary
    doc.rect(14, 45, 182, 25, "F");

    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // Income Green
    doc.text(`Total Income: ${formatCurrency(totalInc)}`, 20, 55);

    doc.setTextColor(244, 63, 94); // Expense Red
    doc.text(`Total Expenses: ${formatCurrency(totalExp)}`, 20, 62);

    doc.setTextColor(15, 23, 42); // Navy for Balance
    doc.setFont("helvetica", "bold");
    doc.text(`Net Balance: ${formatCurrency(balance)}`, 130, 60);

    // 3. Structured Table Implementation
    const tableData = [
      ...incomes.map((i) => [
        i.date,
        "Income",
        i.source,
        "—",
        formatCurrency(i.amount),
      ]),
      ...expenses.map((e) => [
        e.date,
        "Expense",
        e.title,
        e.category,
        `(${formatCurrency(e.amount)})`,
      ]),
    ].sort((a, b) => new Date(b[0]) - new Date(a[0]));

    doc.autoTable({
      startY: 80,
      head: [["Date", "Type", "Description", "Category", "Amount"]],
      body: tableData,
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { font: "helvetica", fontSize: 9 },
      columnStyles: {
        4: { halign: "right", fontStyle: "bold" }, // Align currency to the right
      },
      margin: { top: 80 },
    });

    doc.save(`BudgetTracker_Statement_${new Date().getFullYear()}.pdf`);
  };
  // --- 5. Updated Charts Logic ---
  function renderCharts() {
    const isDark = document.body.classList.contains("dark-mode");
    const textColor = isDark ? "#94a3b8" : "#64748b";
    const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

    const groupedIncomes = groupByMonth(incomes);
    const groupedExpenses = groupByMonth(expenses);

    const allMonths = Array.from(
      new Set([
        ...Object.keys(groupedIncomes),
        ...Object.keys(groupedExpenses),
      ]),
    ).sort((a, b) => {
      const [m1, y1] = a.split("/").map(Number);
      const [m2, y2] = b.split("/").map(Number);
      return y1 !== y2 ? y1 - y2 : m1 - m2;
    });

    const incomeData = allMonths.map(
      (m) => groupedIncomes[m]?.reduce((sum, i) => sum + i.amount, 0) || 0,
    );
    const expenseData = allMonths.map(
      (m) => groupedExpenses[m]?.reduce((sum, e) => sum + e.amount, 0) || 0,
    );

    // Line Chart (Trend)
    const ctxTrend = document.getElementById("trend-chart").getContext("2d");
    if (lineChart) lineChart.destroy();
    lineChart = new Chart(ctxTrend, {
      type: "line",
      data: {
        labels: allMonths,
        datasets: [
          {
            label: "Income",
            data: incomeData,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            fill: true,
            tension: 0.4,
          },
          {
            label: "Expenses",
            data: expenseData,
            borderColor: "#f43f5e",
            backgroundColor: "rgba(244, 63, 94, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: textColor, font: { family: "Plus Jakarta Sans" } },
          },
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } },
        },
      },
    });

    // Pie Chart (Category)
    const catTotals = {};
    expenses.forEach(
      (e) => (catTotals[e.category] = (catTotals[e.category] || 0) + e.amount),
    );
    const ctxPie = document.getElementById("category-chart").getContext("2d");
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(ctxPie, {
      type: "doughnut",
      data: {
        labels: Object.keys(catTotals),
        datasets: [
          {
            data: Object.values(catTotals),
            backgroundColor: [
              "#38bdf8",
              "#818cf8",
              "#fb7185",
              "#34d399",
              "#fbbf24",
              "#a78bfa",
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        cutout: "70%",
        plugins: {
          legend: { position: "bottom", labels: { color: textColor } },
        },
      },
    });
  }

  // --- 6. Helper Utilities ---
  function groupByMonth(items) {
    const grouped = {};
    items.forEach((item) => {
      const datePart = item.date.split(" ")[0];
      const [d, m, y] = datePart.split("/");
      const key = `${m}/${y}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  }

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amt);

  const getFormattedDate = () => {
    const d = new Date();
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() >= 12 ? "PM" : "AM"}`;
  };

  const parseDate = (str) => {
    const [d, t] = str.split(" ");
    const [day, month, year] = d.split("/");
    return `${year}-${month}-${day}T${t}`;
  };

  const renderCategoryDropdown = () => {
    elements.categorySelect.innerHTML = categories
      .map((c) => `<option value="${c}">${c}</option>`)
      .join("");
  };

  // --- 7. Global Actions ---
  window.deleteEntry = (date, type) => {
    if (!confirm("Delete transaction?")) return;
    if (type === "Income") incomes = incomes.filter((i) => i.date !== date);
    else expenses = expenses.filter((e) => e.date !== date);
    updateDashboard();
  };

  const setupTheme = () => {
    const savedTheme = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("dark-mode", savedTheme);
    elements.themeToggle.checked = savedTheme;
    elements.themeToggle.onchange = () => {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem("darkMode", elements.themeToggle.checked);
      renderCharts();
    };
  };

  elements.searchBar.oninput = (e) => updateDashboard(e.target.value);
  document.getElementById("reset-btn").onclick = () => {
    if (confirm("Reset everything?")) {
      localStorage.clear();
      location.reload();
    }
  };

  init();

  document.getElementById("current-year").innerText = new Date().getFullYear();
});
