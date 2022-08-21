"use strict";
const BudgetController = (() => {
    class Item {
        constructor(description, amount, itemType) {
            this.description = description;
            this.amount = amount;
            this.itemType = itemType;
            this.id = ++Item.counter;
        }
    }
    Item.counter = 0;
    const database = { incomes: [], expenses: [] };
    return {
        addListItem(item) {
            const newItem = new Item(item.description, item.amount, item.itemType);
            database[item.itemType === 'inc' ? 'incomes' : 'expenses'].push(newItem);
            return newItem;
        },
        calcBudget() {
            const totalIncome = database.incomes.reduce((accumulatedValue, currentExpense) => accumulatedValue + currentExpense.amount, 0);
            const totalExpense = database.expenses.reduce((accumulatedValue, currentExpense) => accumulatedValue + currentExpense.amount, 0);
            return {
                income: totalIncome,
                expense: totalExpense,
                budget: Math.max(totalIncome - totalExpense, 0),
            };
        },
        removeListItem(itemType, itemId) {
            const list = database[itemType === 'inc' ? 'incomes' : 'expenses'];
            const indexOfItemToBeRemoved = list.findIndex(listItem => listItem.id === itemId);
            list.splice(indexOfItemToBeRemoved, 1);
        },
    };
})();
const UIController = (() => {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    const DOMElements = {
        dateDisk: document.querySelector('.display__date'),
        budgetDisk: document.querySelector('.display__budget'),
        incomeTotalDisk: document.querySelector('.tab--inc .tab__amount'),
        expenseTotalDisk: document.querySelector('.tab--exp .tab__amount'),
        choiceInput: document.querySelector('.control__choice'),
        descInput: document.querySelector('.control__input--description'),
        amountInput: document.querySelector('.control__input--amount'),
        itemForm: document.querySelector('.control__form'),
        itemsContainer: document.querySelector('.items-container'),
        incomesList: document.querySelector('.list--inc'),
        expensesList: document.querySelector('.list--exp'),
    };
    return {
        get DOM() {
            return DOMElements;
        },
        displayDate() {
            const today = new Date();
            DOMElements.dateDisk.textContent = `Available budget in ${months[today.getMonth()]}, ${today.getFullYear()}`;
        },
        addListItem(item) {
            const markup = `
				<li class="item" id="${item.itemType}-${item.id}" data-type="${item.itemType}" data-id="${item.id}">
          <span class="item__description">${item.description}</span>
          <span class="item__amount">₹${item.amount}</span>
          <button class="item__remove-btn">&times;</button>
        </li>
			`;
            (item.itemType === 'inc'
                ? DOMElements.incomesList
                : DOMElements.expensesList).insertAdjacentHTML('beforeend', markup);
        },
        updateBudget(budget) {
            DOMElements.incomeTotalDisk.textContent = `₹${budget.income}`;
            DOMElements.expenseTotalDisk.textContent = `₹${budget.expense}`;
            DOMElements.budgetDisk.textContent = `₹${budget.budget}`;
        },
        clearInputs() {
            DOMElements.descInput.value = DOMElements.amountInput.value = '';
            DOMElements.descInput.focus();
        },
        removeListItem(listItemElement) {
            listItemElement.remove();
        },
    };
})();
const AppController = ((uiCtrl, budgetCtrl) => {
    const { DOM } = UIController;
    const addListItem = (e) => {
        e.preventDefault();
        const amount = +DOM.amountInput.value;
        const description = DOM.descInput.value;
        if (!amount || !description)
            return;
        const item = {
            amount,
            description,
            itemType: DOM.choiceInput.value,
        };
        const listItemWithId = budgetCtrl.addListItem(item);
        uiCtrl.addListItem(listItemWithId);
        const budget = budgetCtrl.calcBudget();
        uiCtrl.updateBudget(budget);
        uiCtrl.clearInputs();
    };
    const removeListItem = (e) => {
        var _a;
        const target = e.target;
        if (!((_a = target.className) === null || _a === void 0 ? void 0 : _a.includes('item__remove-btn')))
            return;
        const listItemElement = target.closest('.item');
        uiCtrl.removeListItem(listItemElement);
        const { type: itemType, id: itemId } = listItemElement.dataset;
        budgetCtrl.removeListItem(itemType, +itemId);
        const budget = budgetCtrl.calcBudget();
        uiCtrl.updateBudget(budget);
    };
    return {
        init() {
            uiCtrl.displayDate();
            DOM.itemForm.addEventListener('submit', addListItem);
            DOM.itemsContainer.addEventListener('click', removeListItem);
        },
    };
})(UIController, BudgetController);
AppController.init();
