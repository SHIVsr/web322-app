const fs = require("fs");

let = posts = [];
let categories = [];

module.exports.initialize=()=>{
    return new Promise((resolve,reject) =>{
        fs.readFile('./data/posts.json','utf-8',(err,data)=>{
            if(err){
                return reject("file not found");
            }
            posts = JSON.parse(data);
        fs.readFile('./data/categories.json','utf-8',(err,data)=>{
            if(err){
                return reject("file not found");
            }
            categories = JSON.parse(data);
                resolve();    
            });
        });
    });
}
module.exports.getAllPosts = () =>{
    return new Promise((reject,resolve) =>{
        if(posts.length === 0){
            return reject("no results retured")
        }
        resolve(posts);
    })
}

module.exports.getPublishPosts = () =>{
    return new Promise((reject,resolve)=>{
        const publishPost = posts.filter(post => post.published);
        if(posts.length === 0){
            return reject("no results returned")
        }
        resolve(publishPost);
    })
}


module.exports.getCategories = () => {
    return new Promise((reject,resolve) => {
      if (categories.length === 0) {
        return reject("no results returned");
      }
      resolve(categories);
    });
}

module.exports.addPost = (postData) =>{ 
    return new Promise((reject,resolve) =>{
       // const filterPost = posts.filter(post => post.category === category)
       console.log(postData.length)
       postData.id = posts.length + 1;
        if(postData.published === undefined){
            postData.published = false;
        }
        else{
            postData.published = true;
        }
        
        posts.push(postData);
        resolve(postData);
    });
}

module.exports.getPostByCategory = (category) =>{
    return new Promise((reject,resolve)=>{
        const filterPost = posts.filter(post => post.category === category)
        if(filterPost.length > 0){
            resolve(filterPost);
        }
        else{
            reject("no results returned");
        }
    });
}

module.exports.getPostsByMinDate=(minDateStr) =>{
    return new Promise((reject,resolve) =>{
        const filterPost = posts.filter(post=>new Date(post,postDate) >= new Date(minDateStr));
        if(filterPost.length > 0){
            resolve(filterPost);
        }
        else{
            reject("No results found");
        }
    });
}

module.exports.getPostById = (id) =>{
    return new Promise((reject,resolve) =>{
        const post = posts.find(post => post.id === id);
        if(post){
            resolve(post);
        }
        else{
            reject("No result returned");
        }
    });
}