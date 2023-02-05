/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Shivkumar Virendranath Raval Student ID: 168146215 Date: 05-02-2023
*
*  Cyclic Web App URL: https://tough-fish-crown.cyclic.app/about
*
*  GitHub Repository URL: https://github.com/SHIVsr/web322-app
*
********************************************************************************/ 


var express = require("express");
var path = require("path");
var blog = require("./blog-service");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
  }
   
  //using a static file
  app.use(express.static('public'));
  
  // setup a 'route' to redirect to other URL
  app.get("/", function(req,res){
      res.redirect('/about');
  });
  
  // setup another route to listen on /about
  app.get("/about", function(req,res){
      res.sendFile(path.join(__dirname,"/views/about.html"));
  });

  // setup another route to listen on /blog
  app.get("/Blog", function(req,res){
      blog.getPublishPosts().then(posts => {
        res.send(posts)
      }).catch(err=>{
        res.send({err})
      })
  });
  
  // setup another route to listen on /posts
  app.get("/Posts", function(req,res){
    blog.getAllPosts().then(posts => {
        res.send(posts)
    }).catch(err =>{
        res.send(err)
    })
  });
  
  // setup another route to listen on /Categories
  app.get("/Categories", function(req,res){
    blog.getCategories().then(categories =>{
        req.send(categories)
    }).catch(err=>{
        res.send(err)
    })
  });

  // setup error page
  app.use((req, res) => {
    res.status(404).send("Page Not Found")
  })
  
  // setup http server to listen on HTTP_PORT
  blog.initialize().then(() =>{
      app.listen(HTTP_PORT, onHttpStart);
  }).catch(err=>{
    console.log("error in promise")
  })