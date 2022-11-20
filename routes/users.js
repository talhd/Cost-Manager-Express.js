const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Product = require('../models/products');

//Creating a new user in the users collection
router.post('/newUser', function (req, res){
  let lastId;
  User.find({}).then(function (results){
    if (results.length == 0){
      lastId = 0;
    }
    else {
      lastId = results[results.length - 1].id;
    }

    const newUser = new User({
      id: lastId + 1,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      birthday: req.body.birthday,
      martial_status: req.body.martial_status
    });

    newUser.save().then((newUser) => {
      console.log('new user created');
      res.status(200).send(newUser);
    }).catch(error => res.status(500).send(error));
  }).catch(error => res.status(400).send(error));
});

//get all users
router.get('/', function (req, res, next){
  User.find().then(function (users){
    res.status(200).send(users);
  }).catch(error => res.status(500));
});

// get user by id
router.get('/getUser/:id', function(req, res) {
  User.findOne({id: req.params.id}).then(function(requestedUser){
    if(requestedUser){
      res.status(200).send(requestedUser);
    }
    else{
      res.status(404).send(`there is no user with the id ${req.params.id}`);
    }
  }).catch(error => res.status(400));
});

/*
* Deleting the user and *all* related records.
* if a record don't belong to any user there is no need to keep it in the db.
* */
router.delete('/deleteUser/:id', function(req, res, next) {
  User.findOneAndDelete({id: req.params.id}).then(function (deletedUser){
    res.status(200);
    if(deletedUser == null){
      res.send(`The database had no user with the id ${idToDelete}`);
    }
    else{
      Product.deleteMany({userId: req.params.id}, (error) => console.log('error while deleting products'));
      res.send('the following user and his products was deleted successfully' + deletedUser);
    }
  }).catch((error) => res.status(400).send(error));
});

//Update user
router.put('/updateUser/:id', function(req, res, next){
  User.findOneAndUpdate({id:req.params.id,}, req.body, {new: true}).then(function(updatedData){
    res.status(200).send(updatedData);
  }).catch(error => res.status(500).send(error));
});

module.exports = router;