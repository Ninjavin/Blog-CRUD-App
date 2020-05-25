const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(config.database);
let db = mongoose.connection;

db.once('open', () => {
    console.log("Connected to Database!")
})
db.on('error', (err) => {
    console.log(err);
});

const app = express();

let Article = require('./models/article');

//Loading View Engine
app.set('views', path.join(__dirname + '\\views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Set Public Folder
app.use(express.static(path.join(__dirname, '\\public')));

//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUnitialized: true
}))

//Express Messages Middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return{
            param : formParam,
            msg : msg,
            value : value
        };
    }
}))

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res,next) => {
    res.locals.user = req.user || null;
    next();
})

// Home Route
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if(err)
            console.log(err);
        else{
            res.render('index',{
                title: "Articles",
                articles: articles
            });
        }  
    })
});

// Route Files
let articles = require('./routes/articles.js');
app.use('/articles', articles);
let users = require('./routes/users.js');
app.use('/users', users);

app.listen(3000,() => {
    console.log("Server is up and running!");
});

