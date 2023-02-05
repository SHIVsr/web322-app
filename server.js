var express = require("express");
var path = require("path");
var blog = require("./blog-service.js");
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
      res.sendFile(path.join(__dirname,"/about.html"));
  });

  // setup another route to listen on /blog
  app.get("/blog")
  
  // setup http server to listen on HTTP_PORT
  app.listen(HTTP_PORT, onHttpStart);