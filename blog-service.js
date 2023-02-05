const fs = require("fs");

let = posts = [];
let categories = [];

function initialize(){
    fs.readFile('web322-app/data/posts.json','utf-8',(err,data)=>{
        if(err)
        throw err;
        JSON.parse()
        console.log(data); 
    })
}