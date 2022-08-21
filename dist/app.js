"use strict";
var BudgetController = (function () {
    var Item = /** @class */ (function () {
        function Item(description, amount, itemType) {
            this.description = description;
            this.amount = amount;
            this.itemType = itemType;
            this.id = ++Item.counter;
        }
        Item.counter = 0;
        return Item;
    }());
    var database = { incomes: [], expenses: [] };
    return {
        addListItem: function (item) {
            var newItem = new Item(item.description, item.amount, item.itemType);
            database[item.itemType === 'inc' ? 'incomes' : 'expenses'].push(newItem);
            return newItem;
        },
        calcBudget: function () {
            var totalIncome = database.incomes.reduce(function (accumulatedValue, currentExpense) {
                return accumulatedValue + currentExpense.amount;
            }, 0);
            var totalExpense = database.expenses.reduce(function (accumulatedValue, currentExpense) {
                return accumulatedValue + currentExpense.amount;
            }, 0);
            return {
                income: totalIncome,
                expense: totalExpense,
                budget: Math.max(totalIncome - totalExpense, 0),
            };
        },
        removeListItem: function (itemType, itemId) {
            var list = database[itemType === 'inc' ? 'incomes' : 'expenses'];
            var indexOfItemToBeRemoved = list.findIndex(function (listItem) { return listItem.id === itemId; });
            list.splice(indexOfItemToBeRemoved, 1);
        },
    };
})();
var UIController = (function () {
    var months = [
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
    var DOMElements = {
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
        displayDate: function () {
            var today = new Date();
            DOMElements.dateDisk.textContent = "Available budget in ".concat(months[today.getMonth()], ", ").concat(today.getFullYear());
        },
        addListItem: function (item) {
            var markup = "\n\t\t\t\t<li class=\"item\" id=\"".concat(item.itemType, "-").concat(item.id, "\" data-type=\"").concat(item.itemType, "\" data-id=\"").concat(item.id, "\">\n          <span class=\"item__description\">").concat(item.description, "</span>\n          <span class=\"item__amount\">\u20B9").concat(item.amount, "</span>\n          <button class=\"item__remove-btn\">&times;</button>\n        </li>\n\t\t\t");
            (item.itemType === 'inc'
                ? DOMElements.incomesList
                : DOMElements.expensesList).insertAdjacentHTML('beforeend', markup);
        },
        updateBudget: function (budget) {
            DOMElements.incomeTotalDisk.textContent = "\u20B9".concat(budget.income);
            DOMElements.expenseTotalDisk.textContent = "\u20B9".concat(budget.expense);
            DOMElements.budgetDisk.textContent = "\u20B9".concat(budget.budget);
        },
        clearInputs: function () {
            DOMElements.descInput.value = DOMElements.amountInput.value = '';
            DOMElements.descInput.focus();
        },
        removeListItem: function (listItemElement) {
            listItemElement.remove();
        },
    };
})();
var AppController = (function (uiCtrl, budgetCtrl) {
    var DOM = UIController.DOM;
    var addListItem = function (e) {
        e.preventDefault();
        var amount = +DOM.amountInput.value;
        var description = DOM.descInput.value;
        if (!amount || !description)
            return;
        var item = {
            amount: amount,
            description: description,
            itemType: DOM.choiceInput.value,
        };
        var listItemWithId = budgetCtrl.addListItem(item);
        uiCtrl.addListItem(listItemWithId);
        var budget = budgetCtrl.calcBudget();
        uiCtrl.updateBudget(budget);
        uiCtrl.clearInputs();
    };
    var removeListItem = function (e) {
        var _a;
        var target = e.target;
        if (!((_a = target.className) === null || _a === void 0 ? void 0 : _a.includes('item__remove-btn')))
            return;
        var listItemElement = target.closest('.item');
        uiCtrl.removeListItem(listItemElement);
        var _b = listItemElement.dataset, itemType = _b.type, itemId = _b.id;
        budgetCtrl.removeListItem(itemType, +itemId);
        var budget = budgetCtrl.calcBudget();
        uiCtrl.updateBudget(budget);
    };
    return {
        init: function () {
            uiCtrl.displayDate();
            DOM.itemForm.addEventListener('submit', addListItem);
            DOM.itemsContainer.addEventListener('click', removeListItem);
        },
    };
})(UIController, BudgetController);
AppController.init();
