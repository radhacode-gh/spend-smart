
/* =========================================
   SPENDSMART - PERSONAL EXPENSE TRACKER
   Complete JavaScript
========================================= */

"use strict";

// =========================================
// 1. SELECT HTML ELEMENTS
// =========================================

const transactionForm = document.getElementById("transactionForm");
const titleInput = document.getElementById("transactionTitle");
const amountInput = document.getElementById("transactionAmount");
const categoryInput = document.getElementById("transactionCategory");
const dateInput = document.getElementById("transactionDate");

const monthFilter = document.getElementById("monthFilter");
const selectedMonthLabel = document.getElementById("selectedMonthLabel");

const balanceValue = document.getElementById("balanceValue");
const incomeValue = document.getElementById("incomeValue");
const expenseValue = document.getElementById("expenseValue");
const remainingValue = document.getElementById("remainingValue");

const budgetAmountLabel = document.getElementById("budgetAmountLabel");
const budgetRemainingLabel = document.getElementById("budgetRemainingLabel");
const budgetSpentLabel = document.getElementById("budgetSpentLabel");
const budgetPercentage = document.getElementById("budgetPercentage");
const budgetProgressFill = document.getElementById("budgetProgressFill");
const budgetProgressBar = document.getElementById("budgetProgressBar");
const budgetMessage = document.getElementById("budgetMessage");

const budgetForm = document.getElementById("budgetForm");
const budgetInput = document.getElementById("budgetInput");
const editBudgetButton = document.getElementById("editBudgetButton");
const cancelBudgetButton = document.getElementById("cancelBudgetButton");

const overviewChart = document.getElementById("overviewChart");
const categoryChart = document.getElementById("categoryChart");
const chartSummary = document.getElementById("chartSummary");
const categoryTotal = document.getElementById("categoryTotal");
const categoryLegend = document.getElementById("categoryLegend");

const searchTransactions = document.getElementById("searchTransactions");
const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");
const transactionTableBody = document.getElementById("transactionTableBody");
const transactionEmpty = document.getElementById("transactionEmpty");
const transactionCount = document.getElementById("transactionCount");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

const exportButton = document.getElementById("exportButton");
const todayDate = document.getElementById("todayDate");
const toast = document.getElementById("toast");

const expenseOption = document.getElementById("expenseOption");
const incomeOption = document.getElementById("incomeOption");

// =========================================
// 2. CONSTANTS AND APPLICATION STATE
// =========================================

const STORAGE_KEY = "spendsmart_transactions_v1";
const BUDGET_KEY = "spendsmart_budgets_v1";
const THEME_KEY = "spendsmart_theme_v1";

const DEFAULT_BUDGET = 15000;
const MAX_AMOUNT = 1000000000000;

const CATEGORIES = {
    expense: [
        "Food",
        "Shopping",
        "Transport",
        "Bills",
        "Education",
        "Health",
        "Entertainment",
        "Rent",
        "Travel",
        "Other"
    ],
    income: [
        "Salary",
        "Freelance",
        "Business",
        "Investment",
        "Allowance",
        "Gift",
        "Other"
    ]
};

const CATEGORY_COLORS = [
    "#24966d",
    "#6b76dc",
    "#e9a348",
    "#e67569",
    "#54a8c7",
    "#ad79cb",
    "#d6bd53",
    "#659b7c",
    "#d88ca5",
    "#83918a"
];

const CURRENCY = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
});

let transactions = loadTransactions();
let budgets = loadBudgets();
let selectedMonth = getCurrentMonth();
let toastTimer;

// =========================================
// 3. DATE AND CURRENCY HELPERS
// =========================================

function getTodayString() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getCurrentMonth() {
    return getTodayString().slice(0, 7);
}

function formatMoney(amount) {
    return CURRENCY.format(Number(amount) || 0);
}

function formatDate(dateString) {
    if (!dateString) {
        return "—";
    }

    const parts = dateString.split("-").map(Number);

    const date = new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
    );

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatMonth(monthString) {
    const [year, month] = monthString.split("-").map(Number);

    return new Date(year, month - 1, 1).toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    );
}

function isValidDate(dateString) {
    if (typeof dateString !== "string") {
        return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return false;
    }

    const parts = dateString.split("-").map(Number);

    const date = new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
    );

    return date.getFullYear() === parts[0] &&
        date.getMonth() === parts[1] - 1 &&
        date.getDate() === parts[2];
}

function isValidMonth(monthString) {
    if (typeof monthString !== "string") {
        return false;
    }

    if (!/^\d{4}-\d{2}$/.test(monthString)) {
        return false;
    }

    const [year, month] = monthString.split("-").map(Number);

    return year >= 1000 &&
        year <= 9999 &&
        month >= 1 &&
        month <= 12;
}

function createId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// =========================================
// 4. LOAD AND SAVE DATA
// =========================================

function loadTransactions() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(item => {
            return item &&
                typeof item.id === "string" &&
                typeof item.title === "string" &&
                item.title.trim().length > 0 &&
                Number.isFinite(item.amount) &&
                item.amount > 0 &&
                item.amount <= MAX_AMOUNT &&
                ["income", "expense"].includes(item.type) &&
                typeof item.category === "string" &&
                isValidDate(item.date);
        });
    } catch (error) {
        console.error("Unable to load transactions:", error);
        return [];
    }
}

function saveTransactions() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(transactions)
        );

        return true;
    } catch (error) {
        console.error("Unable to save transactions:", error);
        showToast("Could not save data. Check browser storage.");
        return false;
    }
}

function loadBudgets() {
    try {
        const saved = localStorage.getItem(BUDGET_KEY);

        if (!saved) {
            return {};
        }

        const parsed = JSON.parse(saved);

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return {};
        }

        const cleanBudgets = {};

        Object.entries(parsed).forEach(([month, amount]) => {
            if (
                isValidMonth(month) &&
                typeof amount === "number" &&
                Number.isFinite(amount) &&
                amount >= 0 &&
                amount <= MAX_AMOUNT
            ) {
                cleanBudgets[month] = amount;
            }
        });

        return cleanBudgets;
    } catch (error) {
        console.error("Unable to load budgets:", error);
        return {};
    }
}

function saveBudgets() {
    try {
        localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
        return true;
    } catch (error) {
        console.error("Unable to save budgets:", error);
        showToast("Could not save your budget.");
        return false;
    }
}

function getBudget(month = selectedMonth) {
    return Object.prototype.hasOwnProperty.call(budgets, month)
        ? budgets[month]
        : DEFAULT_BUDGET;
}

// =========================================
// 5. INITIALIZE DATE INPUTS
// =========================================

function initializeDates() {
    todayDate.textContent = new Date().toLocaleDateString(
        "en-IN",
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

    dateInput.value = getTodayString();
    dateInput.max = getTodayString();

    monthFilter.value = selectedMonth;
}

initializeDates();

// =========================================
// 6. TOAST NOTIFICATIONS
// =========================================

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

// =========================================
// 7. TRANSACTION TYPE AND CATEGORIES
// =========================================

function getTransactionType() {
    const selected = document.querySelector(
        'input[name="transactionType"]:checked'
    );

    return selected ? selected.value : "expense";
}

function updateCategoryOptions() {
    const type = getTransactionType();
    const previousValue = categoryInput.value;
    const availableCategories = CATEGORIES[type];

    categoryInput.replaceChildren();

    availableCategories.forEach(category => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryInput.appendChild(option);
    });

    if (availableCategories.includes(previousValue)) {
        categoryInput.value = previousValue;
    }

    expenseOption.classList.toggle("selected", type === "expense");
    incomeOption.classList.toggle("selected", type === "income");
}

document.querySelectorAll('input[name="transactionType"]').forEach(input => {
    input.addEventListener("change", updateCategoryOptions);
});

function updateCategoryFilterOptions() {
    const previousValue = categoryFilter.value;

    const allCategories = [
        ...new Set([
            ...CATEGORIES.expense,
            ...CATEGORIES.income
        ])
    ];

    categoryFilter.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All categories";
    categoryFilter.appendChild(allOption);

    allCategories.forEach(category => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);
    });

    if (
        previousValue === "all" ||
        allCategories.includes(previousValue)
    ) {
        categoryFilter.value = previousValue;
    }
}

updateCategoryOptions();
updateCategoryFilterOptions();

// =========================================
// 8. ADD A TRANSACTION
// =========================================

transactionForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const type = getTransactionType();
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!title) {
        showToast("Please enter a description.");
        titleInput.focus();
        return;
    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > MAX_AMOUNT
    ) {
        showToast("Enter a valid amount greater than zero.");
        amountInput.focus();
        return;
    }

    if (!isValidDate(date)) {
        showToast("Please enter a valid transaction date.");
        dateInput.focus();
        return;
    }

    if (date > getTodayString()) {
        showToast("Future-dated transactions are not supported.");
        dateInput.focus();
        return;
    }

    if (!CATEGORIES[type].includes(category)) {
        showToast("Please choose a valid category.");
        return;
    }

    const newTransaction = {
        id: createId(),
        title: title,
        amount: Math.round(amount * 100) / 100,
        type: type,
        category: category,
        date: date,
        createdAt: new Date().toISOString()
    };

    transactions.unshift(newTransaction);

    if (!saveTransactions()) {
        transactions.shift();
        return;
    }

    // Display the month containing the new transaction.
    selectedMonth = date.slice(0, 7);
    monthFilter.value = selectedMonth;

    transactionForm.reset();

    dateInput.value = getTodayString();
    updateCategoryOptions();

    renderApp();

    showToast(
        type === "income"
            ? "Income added successfully!"
            : "Expense added successfully!"
    );

    titleInput.focus();
});

// =========================================
// 9. CALCULATE FINANCIAL TOTALS
// =========================================

function getMonthTransactions(month = selectedMonth) {
    return transactions.filter(transaction =>
        transaction.date.startsWith(month)
    );
}

function calculateTotals(items) {
    let income = 0;
    let expenses = 0;

    items.forEach(transaction => {
        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expenses += transaction.amount;
        }
    });

    return {
        income,
        expenses,
        balance: income - expenses
    };
}

function updateSummary() {
    const monthlyTransactions = getMonthTransactions();
    const totals = calculateTotals(monthlyTransactions);

    // Balance represents the net balance across all recorded
    // transactions, while income and expenses show the selected month.
    const allTimeTotals = calculateTotals(transactions);

    const budget = getBudget();
    const remaining = budget - totals.expenses;

    balanceValue.textContent = formatMoney(allTimeTotals.balance);
    incomeValue.textContent = formatMoney(totals.income);
    expenseValue.textContent = formatMoney(totals.expenses);
    remainingValue.textContent = formatMoney(remaining);

    selectedMonthLabel.textContent = `${formatMonth(selectedMonth)} overview`;

    updateBudget(totals.expenses, budget, remaining);
}

function updateBudget(expenses, budget, remaining) {
    const percentage = budget > 0
        ? (expenses / budget) * 100
        : (expenses > 0 ? 100 : 0);

    // Cap the bar width, but keep the actual percentage visible.
    const barPercentage = Math.min(percentage, 100);

    budgetAmountLabel.textContent = formatMoney(budget);
    budgetSpentLabel.textContent = `${formatMoney(expenses)} spent`;

    budgetPercentage.textContent =
        `${Math.round(percentage)}%`;

    budgetRemainingLabel.textContent = formatMoney(remaining);

    budgetProgressFill.style.width = `${barPercentage}%`;

    budgetProgressFill.classList.toggle(
        "over-budget",
        expenses > budget
    );

    budgetProgressBar.setAttribute(
        "aria-valuenow",
        String(Math.round(barPercentage))
    );

    budgetProgressBar.setAttribute(
        "aria-valuemax",
        "100"
    );

    if (budget === 0 && expenses === 0) {
        budgetMessage.textContent =
            "Set a budget to start tracking your spending.";
    } else if (budget === 0 && expenses > 0) {
        budgetMessage.textContent =
            "You have expenses but no budget set.";
    } else if (expenses > budget) {
        budgetMessage.textContent =
            `You are ${formatMoney(expenses - budget)} over budget.`;
    } else if (percentage >= 80) {
        budgetMessage.textContent =
            "You're approaching your budget limit. Spend carefully.";
    } else {
        budgetMessage.textContent =
            `${formatMoney(remaining)} remaining in your monthly budget.`;
    }
}

// =========================================
// 10. MONTHLY BUDGET CONTROLS
// =========================================

editBudgetButton.addEventListener("click", function () {
    budgetInput.value = getBudget();
    budgetForm.hidden = false;
    budgetInput.focus();
});

cancelBudgetButton.addEventListener("click", function () {
    budgetForm.hidden = true;
});

budgetForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const amount = Number(budgetInput.value);

    if (
        !Number.isFinite(amount) ||
        amount < 0 ||
        amount > MAX_AMOUNT
    ) {
        showToast("Enter a valid budget amount.");
        budgetInput.focus();
        return;
    }

    const previousBudget = budgets[selectedMonth];

    budgets[selectedMonth] = Math.round(amount * 100) / 100;

    if (!saveBudgets()) {
        if (previousBudget === undefined) {
            delete budgets[selectedMonth];
        } else {
            budgets[selectedMonth] = previousBudget;
        }

        return;
    }

    budgetForm.hidden = true;

    updateSummary();

    showToast("Monthly budget updated!");
});

// =========================================
// 11. MONTH SELECTOR
// =========================================

monthFilter.addEventListener("change", function () {
    if (!isValidMonth(monthFilter.value)) {
        monthFilter.value = selectedMonth;
        return;
    }

    selectedMonth = monthFilter.value;

    renderApp();
});

// =========================================
// 12. DRAW THE INCOME AND EXPENSE BAR CHART
// =========================================

function prepareCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
        return null;
    }

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = rect.width;
    const height = rect.height;

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    const context = canvas.getContext("2d");

    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    return { context, width, height };
}

function drawOverviewChart() {
    const prepared = prepareCanvas(overviewChart);

    if (!prepared) {
        return;
    }

    const { context: ctx, width, height } = prepared;

    const styles = getComputedStyle(document.body);

    const muted = styles.getPropertyValue("--muted").trim();
    const border = styles.getPropertyValue("--border").trim();
    const incomeColor = styles.getPropertyValue("--income").trim();
    const expenseColor = styles.getPropertyValue("--expense").trim();

    const totals = calculateTotals(getMonthTransactions());

    ctx.clearRect(0, 0, width, height);

    const left = 42;
    const right = 12;
    const top = 15;
    const bottom = 28;

    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;

    const maxValue = Math.max(
        totals.income,
        totals.expenses,
        100
    );

    const step = maxValue / 4;

    ctx.font = "10px sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";

    for (let i = 0; i <= 4; i++) {
        const y = top + chartHeight * (i / 4);
        const value = maxValue - step * i;

        ctx.strokeStyle = border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(width - right, y);
        ctx.stroke();

        ctx.fillStyle = muted;
        ctx.fillText(
            compactMoney(value),
            left - 7,
            y
        );
    }

    const groupWidth = chartWidth / 2;
    const barWidth = Math.min(42, groupWidth * 0.27);

    const groups = [
        {
            label: "Income",
            value: totals.income,
            color: incomeColor,
            center: left + groupWidth * 0.5
        },
        {
            label: "Expenses",
            value: totals.expenses,
            color: expenseColor,
            center: left + groupWidth * 1.5
        }
    ];

    groups.forEach(group => {
        const barHeight = (group.value / maxValue) * chartHeight;
        const x = group.center - barWidth / 2;
        const y = top + chartHeight - barHeight;

        ctx.fillStyle = group.color;

        drawRoundedBar(
            ctx,
            x,
            y,
            barWidth,
            Math.max(0, barHeight),
            5
        );

        ctx.fillStyle = muted;
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";

        ctx.fillText(
            group.label,
            group.center,
            height - 7
        );
    });

    chartSummary.textContent =
        `${formatMoney(totals.income)} income · ` +
        `${formatMoney(totals.expenses)} expenses in ${formatMonth(selectedMonth)}.`;
}

function drawRoundedBar(ctx, x, y, width, height, radius) {
    if (height <= 0) {
        return;
    }

    const r = Math.min(radius, width / 2, height / 2);

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
}

function compactMoney(value) {
    const absolute = Math.abs(value);

    if (absolute >= 10000000) {
        return `₹${(value / 10000000).toFixed(1)}Cr`;
    }

    if (absolute >= 100000) {
        return `₹${(value / 100000).toFixed(1)}L`;
    }

    if (absolute >= 1000) {
        return `₹${(value / 1000).toFixed(1)}k`;
    }

    return `₹${Math.round(value)}`;
}

// =========================================
// 13. DRAW CATEGORY DOUGHNUT CHART
// =========================================

function drawCategoryChart() {
    const prepared = prepareCanvas(categoryChart);

    if (!prepared) {
        return;
    }

    const { context: ctx, width, height } = prepared;

    const styles = getComputedStyle(document.body);

    const muted = styles.getPropertyValue("--muted").trim();
    const border = styles.getPropertyValue("--border").trim();

    const expenses = getMonthTransactions().filter(
        transaction => transaction.type === "expense"
    );

    const categoryTotals = {};

    expenses.forEach(transaction => {
        categoryTotals[transaction.category] =
            (categoryTotals[transaction.category] || 0) +
            transaction.amount;
    });

    const entries = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    const total = entries.reduce(
        (sum, entry) => sum + entry[1],
        0
    );

    categoryTotal.textContent = formatMoney(total);

    ctx.clearRect(0, 0, width, height);

    const size = Math.min(width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = size * 0.43;
    const innerRadius = radius * 0.66;

    if (total === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);
        ctx.fillStyle = border;
        ctx.fill("evenodd");

        renderCategoryLegend([]);

        return;
    }

    let angle = -Math.PI / 2;

    entries.forEach(([category, amount], index) => {
        const sliceAngle = (amount / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.arc(
            centerX,
            centerY,
            radius,
            angle,
            angle + sliceAngle
        );

        ctx.arc(
            centerX,
            centerY,
            innerRadius,
            angle + sliceAngle,
            angle,
            true
        );

        ctx.closePath();

        ctx.fillStyle = CATEGORY_COLORS[
            index % CATEGORY_COLORS.length
        ];

        ctx.fill();

        angle += sliceAngle;
    });

    renderCategoryLegend(entries);
}

function renderCategoryLegend(entries) {
    categoryLegend.replaceChildren();

    if (entries.length === 0) {
        const message = document.createElement("p");
        message.className = "chart-summary";
        message.textContent = "No expense data for this month.";

        categoryLegend.appendChild(message);
        return;
    }

    const total = entries.reduce(
        (sum, entry) => sum + entry[1],
        0
    );

    entries.slice(0, 6).forEach(([category, amount], index) => {
        const row = document.createElement("div");
        row.className = "legend-item";

        const name = document.createElement("div");
        name.className = "legend-name";

        const swatch = document.createElement("span");
        swatch.className = "legend-swatch";
        swatch.style.backgroundColor =
            CATEGORY_COLORS[index % CATEGORY_COLORS.length];

        const label = document.createElement("span");
        label.textContent = category;

        name.append(swatch, label);

        const value = document.createElement("span");
        value.className = "legend-value";

        const percentage = Math.round((amount / total) * 100);

        value.textContent = `${percentage}%`;

        row.append(name, value);

        categoryLegend.appendChild(row);
    });

    if (entries.length > 6) {
        const other = document.createElement("p");
        other.className = "chart-summary";
        other.textContent =
            `+ ${entries.length - 6} more categories included in the chart.`;

        categoryLegend.appendChild(other);
    }
}

// =========================================
// 14. SEARCH AND FILTER TRANSACTIONS
// =========================================

function getFilteredTransactions() {
    const searchTerm = searchTransactions.value
        .trim()
        .toLowerCase();

    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;

    return getMonthTransactions()
        .filter(transaction => {
            const matchesSearch = [
                transaction.title,
                transaction.category,
                transaction.type
            ].join(" ").toLowerCase().includes(searchTerm);

            const matchesType =
                selectedType === "all" ||
                transaction.type === selectedType;

            const matchesCategory =
                selectedCategory === "all" ||
                transaction.category === selectedCategory;

            return matchesSearch && matchesType && matchesCategory;
        })
        .sort((a, b) => {
            if (a.date !== b.date) {
                return b.date.localeCompare(a.date);
            }

            return b.createdAt?.localeCompare(a.createdAt || "") || 0;
        });
}

searchTransactions.addEventListener("input", renderTransactions);
typeFilter.addEventListener("change", renderTransactions);
categoryFilter.addEventListener("change", renderTransactions);

// =========================================
// 15. RENDER TRANSACTION TABLE
// =========================================

function renderTransactions() {
    transactionTableBody.replaceChildren();

    const filtered = getFilteredTransactions();

    transactionCount.textContent =
        `${filtered.length} ${filtered.length === 1 ? "record" : "records"}`;

    transactionEmpty.hidden = filtered.length > 0;

    filtered.forEach(transaction => {
        const row = document.createElement("tr");

        // Description and icon
        const descriptionCell = document.createElement("td");

        const descriptionWrapper = document.createElement("div");
        descriptionWrapper.className = "transaction-description";

        const symbol = document.createElement("span");
        symbol.className = "transaction-symbol";
        symbol.textContent = transaction.type === "income" ? "↙" : "↗";

        const description = document.createElement("span");
        description.className = "description-text";
        description.textContent = transaction.title;
        description.title = transaction.title;

        descriptionWrapper.append(symbol, description);
        descriptionCell.appendChild(descriptionWrapper);

        // Category
        const categoryCell = document.createElement("td");
        const categoryTag = document.createElement("span");
        categoryTag.className = "table-category";
        categoryTag.textContent = transaction.category;
        categoryCell.appendChild(categoryTag);

        // Date
        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(transaction.date);

        // Amount
        const amountCell = document.createElement("td");
        amountCell.className =
            `transaction-amount ${transaction.type}`;

        amountCell.textContent =
            `${transaction.type === "income" ? "+" : "−"}${formatMoney(transaction.amount)}`;

        // Delete button
        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-transaction";
        deleteButton.textContent = "×";
        deleteButton.title = "Delete transaction";
        deleteButton.setAttribute(
            "aria-label",
            `Delete ${transaction.title}`
        );

        deleteButton.addEventListener("click", () => {
            deleteTransaction(transaction.id);
        });

        actionCell.appendChild(deleteButton);

        row.append(
            descriptionCell,
            categoryCell,
            dateCell,
            amountCell,
            actionCell
        );

        transactionTableBody.appendChild(row);
    });
}

// =========================================
// 16. DELETE A TRANSACTION
// =========================================

function deleteTransaction(transactionId) {
    const index = transactions.findIndex(
        transaction => transaction.id === transactionId
    );

    if (index === -1) {
        return;
    }

    const transaction = transactions[index];

    const confirmed = window.confirm(
        `Delete "${transaction.title}" (${formatMoney(transaction.amount)})?`
    );

    if (!confirmed) {
        return;
    }

    transactions.splice(index, 1);

    if (!saveTransactions()) {
        transactions.splice(index, 0, transaction);
        return;
    }

    renderApp();
    showToast("Transaction deleted.");
}

// =========================================
// 17. EXPORT TRANSACTIONS AS CSV
// =========================================

exportButton.addEventListener("click", exportCSV);

function exportCSV() {
    const rows = getFilteredTransactions();

    if (rows.length === 0) {
        showToast("No transactions available to export.");
        return;
    }

    function escapeCSV(value) {
        let text = String(value ?? "");

        // Prevent spreadsheet formula injection from text fields.
        if (/^[\s]*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return `"${text.replace(/"/g, '""')}"`;
    }

    const header = [
        "Date",
        "Description",
        "Type",
        "Category",
        "Amount (INR)"
    ];

    const csvRows = [
        header.map(escapeCSV).join(","),
        ...rows.map(transaction => [
            transaction.date,
            transaction.title,
            transaction.type,
            transaction.category,
            transaction.amount.toFixed(2)
        ].map(escapeCSV).join(","))
    ];

    // UTF-8 BOM helps spreadsheet applications recognize text.
    const csvContent = "\uFEFF" + csvRows.join("\r\n");

    const blob = new Blob(
        [csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `spendsmart-${selectedMonth}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    showToast("CSV export started.");
}

// =========================================
// 18. LIGHT MODE AND DARK MODE
// =========================================

function applyTheme(theme) {
    const dark = theme === "dark";

    document.body.classList.toggle("dark-mode", dark);

    themeIcon.textContent = dark ? "☀" : "☾";
    themeText.textContent = dark ? "Light mode" : "Dark mode";

    themeToggle.setAttribute(
        "aria-label",
        dark ? "Switch to light mode" : "Switch to dark mode"
    );

    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
        console.error("Could not save theme:", error);
    }

    // Canvas colors depend on the current theme.
    requestAnimationFrame(drawCharts);
}

function loadTheme() {
    try {
        return localStorage.getItem(THEME_KEY) === "dark"
            ? "dark"
            : "light";
    } catch (error) {
        return "light";
    }
}

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-mode");

    applyTheme(isDark ? "light" : "dark");
});

// =========================================
// 19. REDRAW CHARTS WHEN THE SCREEN CHANGES
// =========================================

function drawCharts() {
    drawOverviewChart();
    drawCategoryChart();
}

let resizeTimer;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(drawCharts, 100);
});

// =========================================
// 20. RENDER THE COMPLETE APPLICATION
// =========================================

function renderApp() {
    updateSummary();
    drawCharts();
    renderTransactions();
}

// =========================================
// 21. START SPENDSMART
// =========================================

updateCategoryOptions();
updateCategoryFilterOptions();
applyTheme(loadTheme());
renderApp();

console.log("SpendSmart loaded successfully.");

