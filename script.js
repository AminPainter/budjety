/////////////////////////////
// Budget Controller
const budgetController = (function () {

    // How an item looks like
    class Item {
        constructor(id, description, amount) {
            this.id = id;
            this.description = description;
            this.amount = amount;
        }
    }

    // Inheritance to eliminate redundant code (same constructor in both classes)
    class Income extends Item { }
    class Expense extends Item { }

    // Data structure that will hold all items
    const data = {
        inc: [],
        exp: []
    };

    // Public interface
    return {
        addListItem(type, description, amount) {
            // Generate unique id property for each item
            const id = data[type][data[type].length - 1]?.id + 1 || 0;

            // Create required object based on type parameter
            const listItem = type === 'inc' ? new Income(id, description, amount) : new Expense(id, description, amount);

            // Push new item in the respective array of data object
            data[type].push(listItem);

            // Return the newly created item to appController so that it can pass it on to UIController
            return listItem;
        },

        calcBudget() {
            // Summation of all elements in inc array
            // Note that in each iteration cur points to an Item() object
            const income = data.inc.reduce((acc, cur) => acc + cur.amount, 0);

            // Summation of all elements in exp array
            // Note that in each iteration cur points to an Item() object
            const expense = data.exp.reduce((acc, cur) => acc + cur.amount, 0)

            // Return all calculations as an object
            return {
                income,
                expense,
                budget: income - expense > 0 ? income - expense : 0
            };
        },

        removeListItem(type, id) {
            // Create an array of all IDs of list items that exist in the data structure
            const itemIDs = data[type].map(cur => cur.id);

            // Find index of item to be deleted in above created array
            const itemIndex = data[type].indexOf(data[type][itemIDs[id]]);

            // Remove the required item based on index
            data[type].splice(itemIndex, 1);
        }
    };

})();

/////////////////////////////
// UI Controller
const UIController = (function () {

    // Selection of all elements in one object
    const DOM = {
        type: document.querySelector('.control__choice'),
        description: document.querySelector('.control__input--description'),
        amount: document.querySelector('.control__input--amount'),
        addBtn: document.querySelector('.control__btn'),
        incList: document.querySelector('.list--inc'),
        expList: document.querySelector('.list--exp'),
        incTotal: document.querySelector('.tab--inc .tab__amount'),
        expTotal: document.querySelector('.tab--exp .tab__amount'),
        budget: document.querySelector('.display__budget'),
        itemsContainer: document.querySelector('.items-container'),
        date: document.querySelector('.display__date')
    };

    // To format numbers
    const numberFormatter = new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: 'INR',
    });

    // Public interface
    return {
        // Getter method to return DOM object to appController as it needs to append event handlers on DOM elements
        get elements() {
            return DOM;
        },

        setDate() {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            const today = new Date();

            DOM.date.textContent += `${months[today.getMonth()]}, ${today.getFullYear()}`;
        },

        addListItem(type, { id, description, amount }) {
            // Generate html template based on inputs given to the method
            const html = `
                <li class="item" id="${type}-${id}">
                    <span class="item__description">${description}</span>
                    <span class="item__amount">${numberFormatter.format(amount)}</span>
                    <button class="item__remove-btn">&times;</button>
                </li>
            `;

            // Insert above HTML in the respective list based on type parameter
            DOM[`${type}List`].insertAdjacentHTML('beforeend', html);
        },

        // To update UI with new calculations done by budgetController
        update({ income, expense, budget }) {
            DOM.incTotal.textContent = numberFormatter.format(income);
            DOM.expTotal.textContent = numberFormatter.format(expense);
            DOM.budget.textContent = numberFormatter.format(budget);
        },

        // Remove a list item from DOM tree
        removeListItem(element) {
            element.remove();
        }
    };

})();

/////////////////////////////
// App Controller
const appController = (function (budgetCtrl, UICtrl) {

    // Calling getter method of UIController
    const DOM = UICtrl.elements;

    // Event handler for click event on addItemBtn
    const addListItem = function () {
        const description = DOM.description.value;
        const amount = Math.abs(DOM.amount.value);
        const type = DOM.type.value;

        // Check if the inputs are valid
        if (!description || !amount) return alert('Fill out the fields correctly');

        UICtrl.addListItem(type, budgetCtrl.addListItem(type, description, +amount.toFixed(2)));

        UICtrl.update(budgetCtrl.calcBudget());
    };

    // Event handler for click event on items container
    // Uses event delegation
    const removeListItem = function (e) {
        // Check if clicked element is removeItemBtn
        const btn = e.target;
        if (!btn.classList.contains('item__remove-btn')) return;

        // Select the LI element which contains the clicked button
        const listItem = btn.closest('.item');

        // Get type and id from ID attribute of item in the DOM tree using destructuring
        const [type, id] = listItem.id.split('-');

        budgetCtrl.removeListItem(type, +id);

        UICtrl.removeListItem(listItem);

        UICtrl.update(budgetCtrl.calcBudget());
    };

    return {
        // This method must be called to setup event listeners
        init() {
            DOM.addBtn.addEventListener('click', addListItem);
            DOM.itemsContainer.addEventListener('click', removeListItem);

            // To add list item when enter key is pressed
            document.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') addListItem();
            });

            // To display current date in the application
            UICtrl.setDate();
        }
    };

})(budgetController, UIController);

// Initializing app and setting event listeners
appController.init();