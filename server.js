/*********************************************************************************
*  WEB322 – Assignment 05
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
                                              },
                                              formatDate: function(dateObj){
                                                let year = dateObj.getFullYear();
                                                let month = (dateObj.getMonth() + 1).toString();
                                                let day = dateObj.getDate().toString();
                                                return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
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
    let viewData = {};
    try {
      let posts = [];
  
      if (req.query.category) {
        posts = await blog.getPublishedPostsByCategory(req.query.category);
      } else {
        posts = await blog.getPublishedPosts();
      }
  
      posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
  
      let post = posts[0];
  
      viewData.posts = posts;
      viewData.post = post;
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      let categories = await blog.getCategories();
  
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
  
    res.render("blog", { data: viewData });

  });

  app.get('/blog/:id', async (req, res) => {

    let viewData = {};

  try {
    let posts = [];

    if (req.query.category) {
      posts = await blog.getPublishedPostsByCategory(req.query.category);
    } else {
      posts = await blog.getPublishedPosts();
    }

    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    viewData.posts = posts;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    viewData.post = await blog.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    let categories = await blog.getCategories();

    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  res.render("blog", { data: viewData });
});
  
  //route to send file addPost.html
  app.get("/Posts/add",function(req,res){
    // res.sendFile(path.join(__dirname,"/views/addPost.html"))
    blog
    .getCategories()
    .then((data) => res.render("addPost", { categories: data }))
    .catch(() => res.render("addPost", { categories: [] }));
  })

  app.get("/posts/delete/:id", (req, res) => {
    blog
      .deletePostById(req.params.id)
      .then(() => res.redirect("/posts"))
      .catch(() =>
        res.status(500).send("Unable to Remove Category / Category not found)")
      );
  });

  
  // setup another route to listen on /posts
  app.get("/posts", function(req,res){
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


  app.get("/categories/add", (_req, res) => {
    res.render("addCategories");
  });

  app.post("/categories/add", (req, res) => {
    blog.addCategory(req.body).then(() => res.redirect("/categories"));
  });
  
  app.get("/categories/delete/:id", (req, res) => {
    blog.deleteCategoryById(req.params.id)
      .then(() => res.redirect("/categories"))
      .catch(() =>
        res.status(500).send("Category not found/Category not removed")
      );
  });
  
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