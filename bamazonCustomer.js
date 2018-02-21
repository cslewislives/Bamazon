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
    name: 'welcome',
    type: 'confirm',
    message: 'Welcome! would you like to see our products?'
}]).then(({
    welcome,
    name,
    religion
}) => {
    if (welcome) {
        con.connect(err => {
            if (err) throw err;
            printTable();
        });
    }
});


function printTable() {
    con.query('SELECT * FROM products', (err, result) => {
        if (err) throw err;
        console.log('\n')
        console.table(result);
        toBuy();
    });
};

function toBuy() {
    inquirer.prompt([{
            name: 'id',
            message: 'What is the ID of the product you would like to buy?',
            validate: input => !isNaN(input)
        },
        {
            name: 'amount',
            message: 'How many would you like to buy?',
            validate: input => !isNaN(input)

        }
    ]).then(({
        id,
        amount
    }) => {
        checkDB(id, amount);
    });
};


function checkDB(id, amount) {
    con.query('SELECT * FROM products WHERE ?', {
        item_id: id
    }, (err, result) => {
        if (err) throw err;
        let info = result[0];
        if (info.stock_quantity >= amount) {
            confirmBuy(id, amount, info);
        } else {
            console.log('\nInsufficient Quantity!\n');
            toBuy();
        }
    });
};

function confirmBuy(id, amount, info) {
    inquirer.prompt([{
        name: 'confirmBuy',
        type: 'confirm',
        message: 'Do you want to buy ' + amount + ' copies of ' + info.product_name + '?'
    }]).then(({
        confirmBuy
    }) => {
        if (confirmBuy) {
            con.query('UPDATE products SET ? WHERE ?', [{
                    stock_quantity: info.stock_quantity - amount
                },
                {
                    item_id: id
                }
            ], (err, result) => {
                if (err) throw err;
                let total = info.price * amount;
                console.log('\nProduct has been bought. Total cost of sale: ' + total + ' dollars.\n')
                buyAgain();
            })
        } else {
            buyAgain();
        }
    });
};

function buyAgain() {
    inquirer.prompt([{
        name: 'again',
        type: 'confirm',
        message: 'Would you like to purchase something else?'
    }]).then(({
        again
    }) => {
        if (again) {
            printTable();
        } else {
            console.log('\nThanks again!');
            con.end();
        }
    });
};