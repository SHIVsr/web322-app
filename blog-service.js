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
    return new promise((reject,resolve) =>{
        if(postData.published === undefined){
            postData.published == false;
        }
        else{
            postData.published == true;
        }

        postData.id = postData.length + 1;
        posts.push(postData);
        resolve(postData);
    });
}