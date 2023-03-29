/*********************************************************************************
*  WEB322 – Assignment 04
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
const exphbs = require("express-handlebars");
const stripJs = require('strip-js');
//const { title } = require("process");
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


app.engine(".hbs",exphbs.engine({
                                  extname: '.hbs',
                                  helpers: {
                                    navLink: function(url, options){
                                              return '<li' + 
                                              ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                                              '><a href="' + url + '">' + options.fn(this) + '</a></li>';
                                              },

                                              //custom helper
                                              equal: function (lvalue, rvalue, options) {
                                                if (arguments.length < 3)
                                                throw new Error("Handlebars Helper equal needs 2 parameters");
                                                if (lvalue != rvalue) {
                                                  return options.inverse(this);
                                                } else {
                                                  return options.fn(this);
                                                }
                                              },
                                              safeHTML: function(context){
                                                return stripJs(context);
                                              }                                            
                                            }
                                          }));
                                          
app.set('view engine','.hbs');

//using a static file
app.use(express.static('public'));

//will add active route to app.local
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
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
   
  
  // setup a 'route' to redirect to other URL
  app.get("/", function(req,res){
      res.redirect('/blog');
  });
  
  // setup another route to listen on /about
  app.get("/about", function(req,res){
      // res.sendFile(path.join(__dirname,"/views/about.html"));
      res.render("about");
  });

  // setup another route to listen on /blog
  app.get("/Blog", async(req,res)=>{
       // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

  });

  app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});
  
  //route to send file addPost.html
  app.get("/Posts/add",function(req,res){
    // res.sendFile(path.join(__dirname,"/views/addPost.html"))
    res.render("addPost");
  })

  
  // setup another route to listen on /posts
  app.get("/Posts", function(req,res){
    const category = req.query.category;
    const minDate = req.query.minDate;
 
    if(category){
      blog.getPostByCategory(category)
      .then((post) =>{
      post.length > 0?
       res.render("posts",{posts: post}):res.render("posts",{message: "No Results"});
      }).catch((err)=>{
        res.render("posts",{message: "No Results"});
      })
    }
    else if(minDate){
      blog.getPostsByMinDate(minDate).then((post)=>{
        post.length > 0?
        res.render("posts",{posts: post}):res.render("posts",{message: "No Results"});
        }).catch((err)=>{
          res.render("posts",{message: "No Results"});
        })
    }
    else{
      blog.getAllPosts() .then((data) => {
        data.length > 0
          ? res.render("posts", { posts: data })
          : res.render("posts", { message: "No Results" });
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
    }
  });

  //setup another route to listen on /Posts/:id
  app.get("/Posts/:id", function(req,res){
    const postId =req.params.id;
    blog.getPostById(postId).then(post => {
      res.json(post);
    }).catch(err=>{
      res.json({message: err});
    })
  })
  
  // setup another route to listen on /Categories
  app.get("/Categories", function(req,res){
    blog.getCategories().then(data =>{
        data.length > 0?
        res.render("categories",{categories: data}):res.render("categories",{message: "No Results"})
    }).catch(()=>{
        res.render("categories",{message: "no result"})
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