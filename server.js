/*********************************************************************************
*  WEB322 – Assignment 03
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
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
var HTTP_PORT = process.env.PORT || 8080;

//setting the cloudinary config to my name
cloudinary.config({
  cloud_name:'dazeqgqat',
  api_key:'615882254819417',
  api_secret:'NZMbXl6VvR9USw0NFqZ8JHbr6mU',
  secure: true
})

//upload variable without disk storge
const upload = multer({
  storage: multer.memoryStorage()
});

app.post("/Posts/add",upload.single("featureImage"), (req,res) =>{
  if(req.file){
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    upload(req).then((uploaded)=>{
        processPost(uploaded.url);
    });
}else{
    processPost("");
}
 
function processPost(imageUrl){
    req.body.featureImage = imageUrl;

    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
    blog.addPost(req.body).then(()=>{
      res.redirect('/')
    }).catch((err)=>{
      res.redirect('/Posts');
    })
} 

})


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

  //route to send file addPost.html
  app.get("/Posts/add",function(req,res){
    res.sendFile(path.join(__dirname,"/views/addPost.html"))
  })

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
    const category = req.query.category;
    const minDate = req.query.minDate;
    if(category){
      blog.getPostByCategory(category).then(posts =>{
        res.json(posts);
      }).catch(err=>{
        res.send(err)
      })
    }
    else if(minDate){
      blog.getPostsByMinDate(minDate).then(posts=>{
        res.json(posts);
      }).catch(err=>{
        res.send(err);
      })
    }
    else{
      blog.getAllPosts().then(posts=>{
        res.json(posts);
      }).catch(err=>{
        res.send(err);
      })
    }
  });

  //setup another route to listen on /Posts/:id
  app.get("/Posts/:id", function(req,res){
    const postId =req.params.id;
    blog.getPostById(postId).then(post => {
      res.json(post);
    }).catch(err=>{
      res.send(err);
    })
  })
  
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