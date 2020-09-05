const express = require('express')
const bodyParser = require('body-parser')
require("dotenv").config();
const mongodb = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
app.use(bodyParser.json());

//Login
app.post('/login', async (req,res) => {
    var user = req.body;
    try {
        const client = await mongodb.connect(process.env.DB);
        const db = client.db("task1");
        var data = await db.collection("users").findOne({email : user.email })
        if(data === null) {
            res.status(404).json({ message: "User does not exists" });
            return;
        }
        const result = await bcrypt.compare(user.password,data.password)
        if(result){
            delete data.password
            let jwtToken = jwt.sign({user : data} , process.env.JWT )
            res.json({message : "success" , user : data , jwtToken : jwtToken })
        }
        else{
            res.json({message : "Password not matching"})
        }

    } catch (err) {
        console.log(err);
        res.json({ message: "failed" });
        return;
    }
})




//Registeration
app.post('/register', async (req,res)=>{
    var user = req.body;
  

   var hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    try {
      const client = await mongodb.connect(process.env.DB);
      const db = client.db("task1");
      const data = await db.collection("users").insertOne(user);
      await client.close();
      res.json({ message: "success" });
    } catch (err) {
      console.log(err);
      res.json({ message: "failed" });
    }
})


      
//loads the tasks
app.get("/tasks", async function (req, res) {
    let client = await mongodb.connect(process.env.DB);
    let db = client.db("todo");
    let data = await db.collection("tasks").find().toArray();
    await client.close();
    res.json({
        data: data,
    });
});


//adds the tasks
app.post('/tasks', async (req,res)=>{
  
    try {
      const client = await mongodb.connect(process.env.DB);
      const db = client.db("todo");
      const data = await db.collection("tasks").insertOne( req.body);
      await client.close();
      
    } catch (err) {
      console.log(err);
     
    }
})




app.listen(process.env.PORT || 4000, () => {
    console.log("Im Listening .... ");
  });
