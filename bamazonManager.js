/**
 * @file File for the Manager function of Bamazon 
 * @author Joshua C.S. Lewis
 * @version 1.0 
*/

var mysql = require('mysql');
var inquirer = require('inquirer');
const cTable = require('console.table');

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: '3308',
    database: 'bamazon_db'
});

inquirer.prompt([{
    name: 'connect',
    type: 'confirm',
    message: 'Welcome to Bamazon Manager. Would you like to connect?'
}]).then(({
    connect
}) => {
    if (connect) {
        connectSQL();
    } else {
        console.log('\nGoodbye');
        return;
    }
});

/** 
 * @function connectSQL
 * @description Connects to the database then runs the manager function
 */
function connectSQL() {
    con.connect(err => {
        if (err) throw err;
        console.log('Connected');
        // seed();
        manager();
    });
};

// function seed() {
//     let sql = 'INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ?';
//     let values = [
//         ["Assassin's Creed Origins", 'Games', 50, 20],
//         ['Monster Energy', 'Beverages', 6, 6],
//         ['DX Racer', 'Furniture', 300, 10],
//         ['Razer Naga', 'Electronics', 60, 5],
//         ['Dinosaur Island', 'Games', 70, 10],
//         ['Vuka Natural Energy', 'Beverages', 4, 25],
//         ['Table of Ultimate Gaming', 'Furniture', 500, 5],
//         ['Asus ROG Swift PG279Q', 'Electronics', 750, 3],
//         ['Horizon Zero Dawn', 'Games', 40, 30],
//         ['Denizen 3 Yr Aged Rum', 'Beverages', 30, 10]
//     ];
//     con.query(sql, [values], (err, res) => {
//         if (err) throw err;
//         console.log('Number of records insert: ' + res.affectedRows);
//     });
// };

/** 
 * @function manager
 * @description Main menu for the app. 
 */
function manager() {
    inquirer.prompt([{
        name: 'manager',
        type: 'list',
        message: 'Please choose an option',
        choices: [
            'View Products',
            'View Low Inventory',
            'Add to Inventory',
            'Add New Product',
            'Exit'
        ]
    }]).then(({manager}) => {
        switch (manager) {
            case 'View Products':
                products();
                break;
            case 'View Low Inventory':
                lowInventory();
                break;
            case 'Add to Inventory':
                addInventory();
                break;
            case 'Add New Product':
                addProduct();
                break;
            case 'Exit':
                console.log('\nGoodbye');
                con.end();
                break;
        }
    })
}

/** 
 * @function products
 * @description Shows the products table.
 */
function products() {
    con.query('SELECT * FROM products', (err, res) => {
        if (err) throw err;
        console.log('\n')
        console.table(res);
        returnToMenu();
    });
};

/** 
 * @function returnToMenu
 * @description Allows the user to return to the main menu
 */
function returnToMenu() {
    inquirer.prompt([{
        name: 'menu',
        type: 'confirm',
        message: 'Would you like to return to the menu?'
    }]).then(({menu}) => {
        if (menu) {
            manager();
        } else {
            console.log('\nGoodbye');
            con.end();
        }
    });
};

/** 
 * @function lowInventory
 * @description Shows all of the items that are low in stock and then asks if user wants to restock right away
 */
function lowInventory() {
    let sql = 'SELECT * FROM products WHERE stock_quantity <= 5';
    con.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        console.log('These items have a quantity of 5 or less.');
        inquirer.prompt([{
            name: 'restock',
            type: 'confirm',
            message: 'Would you like to add inventory now?'
        }]).then(({restock}) => {
            if (restock) {
                addInventory();
            } else {
                returnToMenu();
            }
        });
    });
};

/** 
 * @function addInventory
 * @description Selects product the user would like to add to and runs the confirmAdd function
 */
function addInventory() {
    inquirer.prompt([{
            name: 'id',
            message: 'What is the ID of the product you would like to add to?',
            validate: input => !isNaN(input)
        },
        {
            name: 'amount',
            message: 'How many would you like to add?',
            validate: input => !isNaN(input)

        }
    ]).then(({id, amount}) => {
        con.query('SELECT * FROM products WHERE ?', {item_id: id}, (err, res) => {
            if (err) throw err;
            let info = res[0];
            confirmAdd(id, amount, info);
        });
    });
}

/** 
 * @function confirmAdd
 * @description Once confirmed product is added to the stock
 */
function confirmAdd(id, amount, info) {
    let sql = 'UPDATE products SET stock_quantity = ? WHERE item_id = ?';
    con.query(sql, [(parseFloat(info.stock_quantity) + parseFloat(amount)), id], (err, res) => {
        if (err) throw err;
        console.log('\n' + amount + ' added to: ' + info.product_name);
        returnToMenu();
    })
}

/** 
 * @function addProduct
 * @description Asks the user which product they would like to add to the inventory then adds it.
 */
function addProduct() {
    inquirer.prompt([
        {
            name: 'product',
            message: 'What is the product you would like to add?'
        },
        {
            name: 'department',
            message: 'What department would you like to add to?',
        },
        {
            name: 'price',
            message: 'How much does this product cost?',
            validate: input => !isNaN(input)
        },
        {
            name: 'stock',
            message: 'How many would you like to add?',
            validate: input => !isNaN(input)
        }
    ]).then(({product, department, price, stock}) => {
        let sql = 'INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ?';
        let values = [[product, department, price, stock]];
        con.query(sql, [values], (err, res) => {
            if (err) throw err;
            console.log('\n' + product + ' added!\n');
            returnToMenu();
        });
    })
}