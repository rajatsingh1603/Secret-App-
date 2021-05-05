require('dotenv').config();  //this should be placed at the top
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5")
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
//initializing session
app.use(session({
    secret: "Our Big Bang Theory",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
mongoose.set("useCreateIndex",true);

//creating a user schema 

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);


// userSchema.plugin(encrypt,{secret: process.env.SECRET,encryptedFields: ["password"]});


//creating model for above schema 
const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
   res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
})

app.post("/register",function(req,res){

    // bcrypt.hash(req.body.password,saltRounds,function(err,hash){

    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash
    //     });
    
    //     newUser.save(function(err){
    //         if(!err){
    //             res.render("secrets");
    //         }else{
    //             console.log(err);
    //         }
    //     });
    // });

    User.register({username: req.body.username},req.body.password,
        function(err,user){
            if(err){
                console.log(err);
                res.redirect("/register");
            }else{
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets");
                });
            }
        });

    });



    

app.post("/login",function(req,res){
    // const username = req.body.username;
    // const password = req.body.password

    // User.findOne({email: username},function(err,founduser){
    //     if(err){
    //         console.log(err);
    //     }else{
    //         if(founduser){
    //             bcrypt.compare(password,founduser.password,function(err,result){
    //                 if(result === true){
    //                     res.render("secrets");
    //                 }
    //             });
                   
                
    //         }

    //     }
    // });

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});


 








app.listen(3000,function(){
    console.log("Server started successfully on port 3000");
});


