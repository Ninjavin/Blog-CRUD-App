const express = require('express');
const router = express.Router();

let Article = require('../models/article');
let User = require('../models/user')

// Add Article Get Route
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add', {
        title: 'Add Articles'
    });
});

// Add Article Post Route
router.post('/add', (req, res) => {
    req.checkBody('title', 'Title is required').notEmpty();
    // req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();    

    // Get Errors
    let errors = req.validationErrors();

    if(errors){
        res.render('add', {
            title: 'Add Article',
            errors: errors
        });
    } else{
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
        article.save((err) => {
            if(err){
                console.log(err);
                return;
            } else{
                req.flash('success', 'Article added');
                res.redirect('/');
            }
        });
    }    
});

// Edit Article Get Route
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if(article.author != req.user._id){
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        }
        res.render('edit_article', {
            title: 'Edit Article',
            article: article
        });
    });
});

// Edit Article Post Route
router.post('/edit/:id', (req, res) => {
    let article = {};
    article.title = req.body.title;
    // article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id: req.params.id}

    Article.update(query, article, (err) => {
        if(err){
            console.log(err);
            return;
        } else{
            req.flash('success', 'Article Updated Successfully!')
            res.redirect('/');
        }
    });

});

// Delete Article
router.delete('/:id', (req, res) => {
    if(!req.user._id){
        res.status(500).send();
    }
    let query = { _id: req.params.id }
    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            res.status(500).send();
        } else{
            Article.remove(query, function(err){
                if(err)
                    console.log(err);
                res.send('Success');
            });
        }
    })  
});

// Render Article Get Route
router.get('/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        User.findById(article.author, function(err, user){
            res.render('article', {
                article: article,
                author: user.name
            });
        });
    });
});

// Access Control

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated())
        return next();
    else{
        req.flash('danger', 'Please LogIn!');
        res.redirect('/users/login');
    }
}

module.exports = router;