var mysql = require('mysql');

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: '3308',
    database: 'bamazon_db'
});

con.connect(err => {
    if (err) throw err;
    console.log('Connected');
    let sql = 'INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ?';
    let values = [
        ["Assassin's Creed Origins", 'Games', 50, 20],
        ['Monster Energy', 'Beverages', 6, 6],
        ['DX Racer', 'Furniture', 300, 10],
        ['Razer Naga', 'Electronics', 60, 5],
        ['Dinosaur Island', 'Games', 70, 10],
        ['Vuka Natural Energy', 'Beverages', 4, 25],
        ['Table of Ultimate Gaming', 'Furniture', 500, 5],
        ['Asus ROG Swift PG279Q', 'Electronics', 750, 3],
        ['Horizon Zero Dawn', 'Games', 40, 30],
        ['Denizen 3 Yr Aged Rum', 'Beverages', 30, 10]
    ];
    con.query(sql, [values], (err, result) => {
        if (err) throw err;
        console.log('Number of records insert: ' + result.affectedRows);
    });
    con.end()
});