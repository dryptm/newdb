const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require("mongoose");

var barcodeSchema = new mongoose.Schema({
    Name: String,
    MRP: Number,
    EAN: Number,
    productLink: String
});

var EAN_CODE_DB = mongoose.model('EAN_CODE_DB', barcodeSchema);

const app = express();

function extractColumnData(csvFilePath, columnName) {
    return new Promise((resolve, reject) => {
        const columnData = [];

        fs.createReadStream(path.resolve(csvFilePath))
            .pipe(csv())
            .on('headers', (headers) => {
                console.log('CSV Headers:', headers);
            })
            .on('data', (row) => {
                if (row[columnName] !== undefined) {
                    columnData.push(row[columnName]);
                }
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                resolve(columnData);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}







const csvFilePath = 'unique_ean_data.csv'; // Replace with your CSV file path
const columnName = 'Name'; // Replace with your column name
const columnMrp = 'MRP'
const columnEan = 'EAN'
const columnpLink = 'productLink'
app.get("/", async (req, res) => {
    try {
        const columnNameData = await extractColumnData(csvFilePath, columnName);
        const columnMrpData = await extractColumnData(csvFilePath, columnMrp);
        const columnEanData = await extractColumnData(csvFilePath, columnEan);
        const columnpLinkData = await extractColumnData(csvFilePath, columnpLink);

        for (var i = 1; i < columnNameData.length; i++) {
            const option = {
                Name: columnNameData[i],
                MRP: columnMrpData[i],
                EAN: columnEanData[i],
                productLink: columnpLinkData[i]
            }

            var new_EAN = new EAN_CODE_DB(option);
            await new_EAN.save().then(savedEAN => {
                console.log("Saved to database:", savedEAN);
            }).catch(err => {
                console.error("Error saving to database:", err);
            });
        }

    } catch (error) {
        console.error("Error in / route:", error);
        res.status(500).send({
            error: 'An error occurred while processing the CSV file'
        });
    }
});

const uri = 'mongodb+srv://walkupwagon:walkup_up_wagon%40MK123@cluster0.uc34gsl.mongodb.net/SK?retryWrites=true&w=majority';

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Database connected!!!!');
}).catch(err => {
    console.error('Database connection error:', err);
});

app.listen(8000, () => {
    console.log("Server running at http://localhost:8000");
});