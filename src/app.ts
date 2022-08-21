type Choice = 'inc' | 'exp';
type ListItem = {
  id?: number;
  description: string;
  amount: number;
  itemType: Choice;
};
type Budget = {
  income: number;
  expense: number;
  budget: number;
};

const BudgetController = (() => {
  class Item {
    id: number;
    description: string;
    amount: number;
    itemType: Choice;

    static counter = 0;

    constructor(description: string, amount: number, itemType: Choice) {
      this.description = description;
      this.amount = amount;
      this.itemType = itemType;
      this.id = ++Item.counter;
    }
  }

  const database: {
    incomes: ListItem[];
    expenses: ListItem[];
  } = { incomes: [], expenses: [] };

  return {
    addListItem(item: ListItem) {
      const newItem = new Item(item.description, item.amount, item.itemType);
      database[item.itemType === 'inc' ? 'incomes' : 'expenses'].push(newItem);
      return newItem;
    },

    calcBudget() {
      const totalIncome = database.incomes.reduce(
        (accumulatedValue, currentExpense) =>
          accumulatedValue + currentExpense.amount,
        0
      );
      const totalExpense = database.expenses.reduce(
        (accumulatedValue, currentExpense) =>
          accumulatedValue + currentExpense.amount,
        0
      );
      return {
        income: totalIncome,
        expense: totalExpense,
        budget: Math.max(totalIncome - totalExpense, 0),
      };
    },

    removeListItem(itemType: Choice, itemId: number) {
      const list = database[itemType === 'inc' ? 'incomes' : 'expenses'];
      const indexOfItemToBeRemoved = list.findIndex(
        listItem => listItem.id === itemId
      );
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
    dateDisk: document.querySelector('.display__date')!,
    budgetDisk: document.querySelector('.display__budget')!,
    incomeTotalDisk: document.querySelector('.tab--inc .tab__amount')!,
    expenseTotalDisk: document.querySelector('.tab--exp .tab__amount')!,

    choiceInput: document.querySelector(
      '.control__choice'
    )! as HTMLInputElement,
    descInput: document.querySelector(
      '.control__input--description'
    )! as HTMLInputElement,
    amountInput: document.querySelector(
      '.control__input--amount'
    )! as HTMLInputElement,

    itemForm: document.querySelector('.control__form')!,

    itemsContainer: document.querySelector('.items-container')!,
    incomesList: document.querySelector('.list--inc')!,
    expensesList: document.querySelector('.list--exp')!,
  };

  return {
    get DOM() {
      return DOMElements;
    },

    displayDate() {
      const today = new Date();
      DOMElements.dateDisk.textContent = `Available budget in ${
        months[today.getMonth()]
      }, ${today.getFullYear()}`;
    },

    addListItem(item: ListItem) {
      const markup = `
				<li class="item" id="${item.itemType}-${item.id}" data-type="${item.itemType}" data-id="${item.id}">
          <span class="item__description">${item.description}</span>
          <span class="item__amount">₹${item.amount}</span>
          <button class="item__remove-btn">&times;</button>
        </li>
			`;

      (item.itemType === 'inc'
        ? DOMElements.incomesList
        : DOMElements.expensesList
      ).insertAdjacentHTML('beforeend', markup);
    },

    updateBudget(budget: Budget) {
      DOMElements.incomeTotalDisk.textContent = `₹${budget.income}`;
      DOMElements.expenseTotalDisk.textContent = `₹${budget.expense}`;
      DOMElements.budgetDisk.textContent = `₹${budget.budget}`;
    },

    clearInputs() {
      DOMElements.descInput.value = DOMElements.amountInput.value = '';
      DOMElements.descInput.focus();
    },

    removeListItem(listItemElement: HTMLElement) {
      listItemElement.remove();
    },
  };
})();

const AppController = ((uiCtrl, budgetCtrl) => {
  const { DOM } = UIController;

  const addListItem = (e: Event) => {
    e.preventDefault();

    const amount = +DOM.amountInput.value;
    const description = DOM.descInput.value;
    if (!amount || !description) return;

    const item: ListItem = {
      amount,
      description,
      itemType: DOM.choiceInput.value as Choice,
    };

    const listItemWithId = budgetCtrl.addListItem(item);
    uiCtrl.addListItem(listItemWithId);

    const budget = budgetCtrl.calcBudget();
    uiCtrl.updateBudget(budget);

    uiCtrl.clearInputs();
  };

  const removeListItem = (e: Event) => {
    const target = e.target as HTMLButtonElement;
    if (!target.className?.includes('item__remove-btn')) return;

    const listItemElement: HTMLElement = target.closest('.item')!;
    uiCtrl.removeListItem(listItemElement);

    const { type: itemType, id: itemId } = listItemElement.dataset;
    budgetCtrl.removeListItem(itemType as Choice, +itemId!);

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
