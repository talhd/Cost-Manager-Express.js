const express = require('express');
const router = express.Router();
const Product = require('../models/products');
const User = require('../models/users');
const Report = require('../models/report');

const utils = {};

/**
 * find all products of a specific user
 */
router.get('/:id/getAllProducts', function (req, res){
    User.findOne({id: req.params.id}).then(function (user){
        if (!user){
            //user not found
            res.status(404).send(`There is no user with the id ${req.params.id}`);
        }
        else {
            Product.find({userId:req.params.id}).then(function(products){
                res.status(200).send(products);
            }).catch(error => res.status(500).send(error));
        }
    }).catch(error => res.status(400).send(error));
});

/**
 * get all products sorted by categories
 */
router.get('/:id/getOrgnizedProducts',function (req, res){
    User.findOne({id: req.params.id}).then(function (user){
        if (!user){
            //user not found
            res.status(404).send(`There is no user with the id ${req.params.id}`);
        }
        else {
            Product.find({userId:req.params.id}).sort('category').then(function(products){
                res.status(200).send(products);
            }).catch(error => res.status(500).send(error));
        }
    }).catch(error => res.status(400).send(error));
});

/**
 * get products by a specific category
 */
router.get('/:userId/:categoryName', function (req, res){
    User.findOne({id: req.params.userId}).then(function (user){
        if (!user){
            //user not found
            res.status(404).send(`There is no user with the id ${req.params.id}`);
        }
        else {
            Product.find({userId: req.params.userId, category: req.params.categoryName}).then(function(products){
                res.status(200).send(products);
            }).catch(error => res.status(500).send(error));
        }
    }).catch(error => res.status(400).send(error));
});

/**
 * find specific product for a specific user
 */
router.get('/:userId/getProductById/:productId', function (req, res){
    User.findOne({id: req.params.userId}).then(function (user){
        if(!user){
            //user not found
            res.status(404).send(`There is no user with the id ${req.params.id}`);
        }
        else {
            Product.find({userId: req.params.userId, id: req.params.productId}).then(function (product){
                res.status(200).send(product);
            }).catch(error => res.status(500).send(error));
        }
    }).catch(error => res.status(400).send(error));
});

/*
* add new cost,each cost must belong to a particular user by userId
* */
router.post('/:id/newProduct/', function(req, res) {
    User.findOne({id: req.params.id}).then(function (user) {
        if (!user) {
            res.status(400).send(`There is no user with the id ${req.params.id}`);
            console.log(`Error while creating new product,user ${req.params.id} does not exist`);
        }
        else {
            let lastId;
            Product.find({}).then((results) => {
                //First product in collection
                if (results.length == 0){
                    lastId = 0;
                }
                else {
                    lastId = results[results.length - 1].id;
                }
                const newProduct = new Product({
                    userId: req.params.id,
                    id: lastId + 1,
                    category: req.body.category,
                    description: req.body.description,
                    sum: req.body.sum
                });

                newProduct.save();
                utils.updateDataInReport('post',newProduct);
                console.log(`Product created and saved:\n` + newProduct);
                res.status(200).send(`Product created successfully\n` + newProduct);
            });
        }
    }).catch(error => res.status(400).send(error));
});

/**
 * delete product for a specific user by id
 */
router.delete('/:userId/deleteProduct/:productId', function (req, res){
    Product.findOneAndDelete({userId: req.params.userId, id: req.params.productId}, {returnDocument: true}).then(function (result){
        if(result){
            utils.updateDataInReport('delete', result);
            res.status(200).send('The following product has been removed : \n' + result);
        }
        else {
            res.send(`Couldn't find product with the id ${req.params.productId}`);
        }
    }).catch(error => res.stats(400).send(error));
});

/**
 * update product
 */
router.put('/:userId/updateProduct/:productId', function(req, res, next){
    User.findOne({id: req.params.userId}).then(function (user){
        if (!user){
            //user not found
            res.status(404).send(`There is no user with the id ${req.params.id}`);
        }
        else {
            Product.findOneAndUpdate({id:req.params.productId,}, req.body, {new: true}).then(function(updatedData){
                res.status(200).send(updatedData);
            }).catch(error => res.status(500).send(error));
        }
    }).catch(error => res.status(400).send(error));
});

/**
 * get detailed report for a given month and year
 */
router.get('/:userId/getReport/:month/:year', function (req, res){
    Report.findOne({userId: Number(req.params.userId), year: Number(req.params.year), month:Number(req.params.month)}).then(function (result){
        //The report is already computed
        if(result){
            res.status(200).send(`Report for ${req.params.month}/${req.params.year}:\n Created Date : ${result.dateCreated}\nTotal expenses:${result.sum} \nThe expenses: ${result.productArray.toString()}`);
        }
        //The report has to be computed
        else {
            console.log('Creating new report..');
            Product.find({userId: req.params.userId}).then(function (userProducts){
                let productMonth;
                let productYear;
                let productsSum = 0;
                const productsArray = [];

                for(let i = 0; i < userProducts.length; i++){
                    productYear = userProducts[i].date.getUTCFullYear();
                    productMonth = userProducts[i].date.getUTCMonth() + 1;

                    if(productYear == req.params.year && productMonth == req.params.month){
                        productsArray.push(`\n ${userProducts[i].description} (${userProducts[i].category})`);
                        productsSum += userProducts[i].sum;
                    }
                }

                const newReport = new Report({
                    userId: req.params.userId,
                    year: req.params.year,
                    month: req.params.month,
                    sum: productsSum,
                    productArray: productsArray
                });

                newReport.save();
                res.status(200).send(`Report for ${req.params.month}/${req.params.year}:\n Created Date : ${newReport.dateCreated}\nTotal expenses:${newReport.sum} \nThe expenses: ${newReport.productArray.toString()}`);

            }).catch(error => res.status(500).send(error));
        }
    }).catch(error => res.stats(400).send(error));
});

utils.updateDataInReport = function (typeOfOpertaion, product){
    return new Promise(function (resolve, reject){
        console.log('in updateDataInReport()');
        const productMonth = product.date.getUTCMonth() + 1;
        const productYear = product.date.getUTCFullYear();
        Report.findOne({userId: product.userId, year: productYear, month: productMonth}).then(function (result){
            // no report to update
            console.log(result)
            if(!result){
                console.log('in updateDataInReport() , no report to update.');
                resolve();
            }
            else{
                if(typeOfOpertaion == 'post'){
                    console.log('in updateDataInReport() , product added');
                    const newSum = result.sum + product.sum;
                    Report.findOneAndUpdate({userId: product.userId, year: productYear, month: productMonth},
                        {sum: newSum, $push: {productArray: `\n${product.description} (${product.category})`}}).then(console.log("report updated"));
                    resolve();
                }
                if(typeOfOpertaion == 'delete'){
                    console.log('in updateDataInReport() , product deleted');
                    const newSum = result.sum - product.sum;
                    Report.findOneAndUpdate({userId: product.userId, year: productYear, month: productMonth},
                        {sum: newSum, $pull: {productArray: `\n${product.description} (${product.category})`}}).then(console.log('report updated.'));
                    resolve();
                }
            }
            reject();
        });
    });
}

module.exports = router;



