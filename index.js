const express = require('express');
const cors = require('cors')
const app =express();
const port = process.env.PORT || 5000
require('dotenv').config()
//middleware
app.use(cors())
app.use(express.json())

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fpdogwm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db("taskManagementDB").collection("users")
    const taskCollection = client.db("taskManagementDB").collection("tasks")
  //users related api
  app.post('/users',async(req,res)=>{
    const user= req.body;
    //insert email if user does not exist
    const query = {email: user.email}
    const existingUser = await userCollection.findOne(query)
    if(existingUser){
      return res.send({message: 'user already exist',insertedId:null})
    }
    const result = await userCollection.insertOne(user)
    res.send(result)
   })

//task related api
app.post('/tasks',async(req,res)=>{
  const task=req.body
  const result = await taskCollection.insertOne(task)
  res.send(result)
})
   

//email specific task list
//email specific vendor product list
app.get('/tasks',async(req,res)=>{
  try {
    const email = req.query.email;
    const status= req.query.status;
    const query = { email: email };
    if (status) {
      query.status = status;
    }
    const result = await taskCollection.find(query).sort({ createdAt: -1 }).toArray();
    console.log(result);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
 })

//delete task specific data
app.delete('/tasks/:id',async(req,res)=>{
  const id = req.params.id
  const query= {_id: new ObjectId(id)}
  const result = await taskCollection.deleteOne(query)
  res.send(result)
})

//update task
app.get('/update/:id',async(req,res)=>{
  const id =req.params.id
  const query ={_id: new ObjectId(id)}
  const task =await taskCollection.findOne(query)
  res.send(task)
})

  app.patch('/task/:id', async (req, res) => {
    try {
   
  const id =req.params.id
      
  const filter ={_id: new ObjectId(id)}
     
     
      const dataToUpdate = {
        title: req.body.title,
        description:req.body.description,
        date:req.body.date,
        priority:req.body.priority,
        status:'todo'
      };
    console.log(dataToUpdate);
      const updateDoc = {
        $set: dataToUpdate,
      };
  
    
      const result = await taskCollection.updateOne(filter, updateDoc);
  
      res.send(result);
    } catch (error) {
      console.error('Error updating badge:', error);
      res.status(500).send('Internal Server Error');
    }
  });










    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);









app.get('/',(req,res)=>{
  res.send('user management server is running')
})

app.listen(port,()=>{
  console.log(`server is running on PORT: ${port}`);
})