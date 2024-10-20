const sqlite3 = require("sqlite3");

module.exports = function() {
    this.integer = "INT";
    this.character = "CHAR";
    this.text = "TEXT";
    this.double = "DOUBLE";

    this.db = null;

    this.Open = async function(dbFile) {
        this.db = new sqlite3.Database(dbFile);
    }

    this.CreateTable = async function(name, cols) {
        colText = "";
        for (col in cols) {
            colText = colText + col + " " + cols[col] + ",";
        }
        if (colText.charAt(colText.length - 1) == ",") {
            colText = colText.slice(0, -1);
        }
        await this.db.exec(`CREATE TABLE IF NOT EXISTS ${name} (` + colText + `)`);
    }

    this.TableExists = async function(name) {
        this.db.get(`IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'
            AND TABLE_NAME='${name}') SELECT 1 AS res ELSE SELECT 0 AS res`);
    }

    this.InsertIntoTable = async function(name, cols, duplicate = true) {
        colText = "";
        valText = "";
        for (col in cols) {
            colText = colText + " " + col + ",";
            valText = valText + " " + cols[col] + ",";
        }
        if (colText.charAt(colText.length - 1) == ",") {
            colText = colText.slice(0, -1);
        }
        if (valText.charAt(valText.length - 1) == ",") {
            valText = valText.slice(0, -1);
        }
        if (duplicate) {
            await this.db.run(`INSERT INTO ${name} (${colText}) VALUES (${valText})`);
        }
        else {
            whereText = "";
            for (col in cols) {
                whereText = whereText + " " + col + " = " + cols[col] + " AND ";
            }
            if (whereText.charAt(whereText.length - 1) == " ") {
                whereText = whereText.slice(0, -4);
            }
            await this.db.run(`INSERT INTO ${name} (${colText}) SELECT ${valText}
                WHERE NOT EXISTS (SELECT ${colText} FROM ${name} WHERE ${whereText})`);
        }
    }
    
    this.UpdateInTable = async function(name, setCols, searchCols) {
        setText = "";
        for (col in setCols) {
            setText = setText + " " + col + " = " + setCols[col] + ", ";
        }
        if (setText.charAt(setText.length - 1) == " ") {
            setText = setText.slice(0, -2);
        }
        whereText = "";
        for (col in searchCols) {
            whereText = whereText + " " + col + " = " + searchCols[col] + " AND ";
        }
        if (whereText.charAt(whereText.length - 1) == " ") {
            whereText = whereText.slice(0, -4);
        }

        if (whereText === "") {
            await this.db.run(`UPDATE ${name} SET ${setText}`);
        }
        else {
            await this.db.run(`UPDATE ${name} SET ${setText} WHERE ( ${whereText} )`);
        }
    }

    this.DeleteFromTable = async function(name, searchCols) {
        whereText = "";
        for (col in searchCols) {
            whereText = whereText + " " + col + " = " + searchCols[col] + " AND ";
        }
        if (whereText.charAt(whereText.length - 1) == " ") {
            whereText = whereText.slice(0, -4);
        }
        await this.db.run(`DELETE FROM ${name} WHERE ${whereText}`);
    }

    this.GetTable = async function(name) {
        await this.db.each(`SELECT * FROM ${name}`, function(err, rows) {
            
        });
    }

    this.GetRows = async function(name, cols) {
        whereText = "";
        for (col in cols) {
            whereText = whereText + " " + col + " = " + cols[col] + " AND ";
        }
        if (whereText.charAt(whereText.length - 1) == " ") {
            whereText = whereText.slice(0, -4);
        }
        
        this.db.all(`SELECT * FROM ${name} WHERE ${whereText}`, (err, row) => {
            
        });
    }

    this.GetAllRows = async function(name, callback) {
        this.db.all(`SELECT * FROM ${name}`, (err, rows) => {
            if (err) {
                console.log("Error getting all rows.");
                callback(null);
            } else {
                if (rows) {
                    callback(rows);
                } else {
                    console.log("Error getting row entries.");
                    callback(null);
                }
            }
        });
    }

    this.GetColumns = async function(name, cols) {
        colText = "";
        cols.forEach(col => {
            colText = colText + col + ","
        });
        if (colText.charAt(colText.length - 1) == ",") {
            colText = colText.slice(0, -1);
        }
        return await this.db.all(`SELECT ${colText} FROM ${name}`);
    }

    this.GetElements = async function (name, cols, filters) {
        whereText = "";
        for (filter in filters) {
            whereText = whereText + " " + filter + " = " + filters[filter] + " AND ";
        }
        colText = "";
        cols.forEach(col => {
            colText = colText + col + ","
        });
        if (colText.charAt(colText.length - 1) == ",") {
            colText = colText.slice(0, -1);
        }
        return await this.db.all(`SELECT ${colText} FROM ${name} WHERE ${whereText}`);
    }

    this.Run = async function(command) {
        return await this.db.run(command);
    }

    this.Get = async function(command) {
        return await this.db.all(command);
    }
}