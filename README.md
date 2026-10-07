# 💰 BudgetTracker

BudgetTracker is a client-side personal finance dashboard for recording income and expenses, monitoring a running balance, reviewing transaction history, and visualizing financial activity.

The application is designed for local use: transaction data and theme preferences are stored in the browser, and no backend or account is required.

## ✨ Features

- **Income tracking:** Record an income source and amount in Nigerian naira.
- **Expense tracking:** Record an expense title, amount, and category.
- **Summary cards:** View total income, total expenses, and remaining balance.
- **Unified transaction history:** See income and expense entries together, sorted by date.
- **Search:** Filter transactions by source, title, or expense category.
- **Category breakdown:** View expense distribution in a doughnut chart.
- **Monthly trends:** Compare income and expenses over time with a line chart.
- **PDF export:** Generate a formatted financial statement with summary totals and transaction details.
- **Dark mode:** Switch between light and dark themes with the preference saved locally.
- **Delete transactions:** Remove individual entries after confirmation.
- **Reset data:** Clear the dashboard's stored data and reload the application.
- **Responsive dashboard:** Use the interface across desktop and mobile screen sizes.

## 🛠️ Built with

- **HTML5** for the dashboard structure and forms
- **CSS3** for the responsive layout, cards, themes, and visual styling
- **Vanilla JavaScript (ES6+)** for state management, calculations, rendering, searching, and local storage
- **Chart.js** for line and doughnut charts
- **jsPDF** for PDF generation
- **jsPDF-AutoTable** for formatted transaction tables in exported statements
- **Font Awesome** for interface icons
- **Plus Jakarta Sans** for dashboard typography

## 🚀 Getting started

### Prerequisites

You only need a modern web browser. No build tools, package manager, backend, or database is required.

### Run locally

1. **Clone the repository**

   ```bash
   git clone https://github.com/david-godspower/budget-tracker.git
   ```

2. **Open the project directory**

   ```bash
   cd budget-tracker
   ```

3. **Launch the dashboard**

   Open `index.html` directly in a browser, or use the **Live Server** extension in VS Code.

   A local server is recommended because Chart.js, jsPDF, AutoTable, Font Awesome, and the Google Font are loaded from CDNs.

## 🎯 How to use

### Add income

1. Keep the **Income** tab selected.
2. Enter an income source.
3. Enter the amount in naira.
4. Select **Add Income**.

### Add an expense

1. Select the **Expense** tab.
2. Enter an expense title and amount.
3. Choose a category.
4. Select **Add Expense**.

### Review and manage data

- Use the search field to filter the transaction history.
- Use the trash icon beside a transaction to delete it.
- Use the moon icon to toggle dark mode.
- Use the PDF icon to export a financial statement.
- Use **Reset All** to clear stored income, expense, and theme data.

## 📊 Default expense categories

New expenses can be assigned to:

- Transport
- Food
- Data
- Books
- Tithe
- Groceries
- Savings
- Rent
- Entertainment
- Others

## 💾 Data storage

The app stores data in browser `localStorage`:

| Key | Contents |
|---|---|
| `incomes` | Saved income entries |
| `expenses` | Saved expense entries |
| `darkMode` | Whether dark mode is enabled |

The dashboard uses Nigerian naira (`NGN`) formatting. Data remains on the current browser and device; it is not synchronized to an account or server.

## 📄 PDF reports

The **Export PDF** control creates a `BudgetTracker_Statement_<year>.pdf` report containing:

- Total income
- Total expenses
- Net balance
- A dated transaction table
- Income and expense descriptions
- Expense categories

## 📁 Project structure

```text
budget-tracker/
├── index.html      # Dashboard markup, forms, charts, and controls
├── script.js       # State management, calculations, rendering, and exports
├── styles.css      # Dashboard layout, themes, and responsive styling
├── PayButton.js    # Standalone Paystack payment component draft
├── LICENSE         # MIT license
└── README.md       # Project documentation
```

`PayButton.js` is a React/Paystack component and is not imported by the current static HTML dashboard. It should be configured and integrated separately before use, and payment credentials should never be exposed in production frontend code.

## 🔒 Privacy and security

- Financial entries are stored locally in the browser.
- The current dashboard does not send transaction data to an application server.
- Clearing browser storage or selecting **Reset All** removes the saved dashboard data.
- External CDN resources require an internet connection.
- This application is not a substitute for professional financial advice.

## 🌐 Live demo

[**Open BudgetTracker**](https://david-godspower.github.io/budget-tracker)

## 👤 Author

**David Godspower Ajala**

- [Portfolio](https://davidgodspowerajala.me)
- [LinkedIn](https://www.linkedin.com/in/david-godspower-ajala/)
- [Facebook](https://facebook.com/DavidGodspowerAjalaDGA/)
- [Twitter/X](https://x.com/DavidGAjala)
- [Email](mailto:ajaladavid11@gmail.com)

## 📄 License

This project is available under the [MIT License](LICENSE).
