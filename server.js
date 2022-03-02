const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const mongoose = require("mongoose");
const { Schema } = mongoose;
let bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let exerciseSchema = new Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String
});

let userSchema = new Schema({
  username: { type: String, required: true },
  log: [exerciseSchema],
});

let Exercise = mongoose.model("Exercise", exerciseSchema);

let User = mongoose.model("User", userSchema);

app.post(
  "/api/users",
  bodyParser.urlencoded({ extended: false }),
  (request, response) => {
    console.log("api post of user- - - - - - - -",request.body);
    const user = new User({ username: request.body.username });
    user.save((err, data) => {
      if (!err) {
        response.json({ username: data.username, _id: data.id });
      }
    });
  }
);

app.get("/api/users", (request, response) => {
  User.find({})
    .select("-__v")
    .exec((err, data) => {
      response.json(data);
    });
});
app.post(
  "/api/users/:_id/exercises",
  bodyParser.urlencoded({ extended: false }),
  (request, response) => {
    console.log("params- - - -",request.params);
    console.log("body- - - - -",request.body);

    const newexercise = new Exercise({
      description: request.body.description,
      duration: request.body.duration,
      date: new Date(request.body.date).toDateString(),
    });

    if (newexercise.date === "" || !request.body.date ) {
      newexercise.date = new Date(new Date().toISOString().substring(0, 10)).toDateString();
    }

    //   newexercise.save((err,data)=>{
    //     if(!err){

    //     }
    //   })

    //   response.json({id:request.body._id,username:request.body.username,desciption:request.body.description})

    User.findByIdAndUpdate(
      request.params._id,
      { $push: { log: newexercise } },
      { new: true },
      (err, data) => {
        if (!err) {
          console.log(" find bu id  updated data- - - -",data);
          response.json({
            _id: data.id,
            username: data.username,
            date: newexercise.date,
            duration: newexercise.duration,
            description: newexercise.description
          });
        }
      }
    );
  }
);

app.get('/api/users/:_id/logs',(request,response)=>{
  
  User.findById(request.params._id).select('-__v').exec((err,data)=>{
    if(!err){
      let mappingData=data;
      // let newlog=data.log.filter((item)=>(item.date=(item.date).toDateString))
      // console.log("new log-----------------\n",newlog);
      let responseObject=data.log.map((item)=>({
        "description":item.description,
          "duration":item.duration,
            "date":(item.date)
      }))
      console.log("response object -----------------\n",responseObject);
      console.log(typeof responseObject[0].date)
      
      
      
      if(request.query.from || request.query.to){
        
        let fromDate = new Date(0)
        let toDate = new Date()
        
        if(request.query.from){
          fromDate = new Date(request.query.from)
        }
        
        if(request.query.to){
          toDate = new Date(request.query.to)
        }
        
        fromDate = fromDate.getTime()
        toDate = toDate.getTime()
        
        responseObject = responseObject.filter((session) => {
          let sessionDate = new Date(session.date).getTime()
          
          return sessionDate >= fromDate && sessionDate <= toDate
          
        })
        
      }
      
      if(request.query.limit){
        responseObject = responseObject.slice(0, request.query.limit)
      }
      
      
      
      
      response.json({_id:data._id,username:data.username,count:data.log.length,log:responseObject});
    }
    
  })
  
  
})
// app.get('/api/users/:id/logs',(request,response)=>{
  
//   User.findById(request.params._id).select('-__v').exec((err,data)=>{
//     if(!err){
//       console.log(data.log.id);
//       let mappingData=data;
//       let newlog=data.log.map((item)=>({
//         "description":item.description,
//           "duration":item.duration,
//             "date":item.date
//       }))
//       response.json({_id:data._id,username:data.username,count:data.log.length,log:newlog});
//     }
    
//   })
  
  
// })


app.get('/api/users/:id/logs',(request,response)=>{
  
  User.findById(request.params._id).select('-__v').exec((err,data)=>{
    if(!err){
      let mappingData=data;
      let responseObject=data.log.map((item)=>({
        "description":item.description,
          "duration":item.duration,
            "date":new Date(item.date).toDateString()
      }))
      console.log(typeof responseObject[0].date)
      
      
      
      if(request.query.from || request.query.to){
        
        let fromDate = new Date(0)
        let toDate = new Date()
        
        if(request.query.from){
          fromDate = new Date(request.query.from)
        }
        
        if(request.query.to){
          toDate = new Date(request.query.to)
        }
        
        fromDate = fromDate.getTime()
        toDate = toDate.getTime()
        
        responseObject = responseObject.filter((session) => {
          let sessionDate = new Date(session.date).getTime()
          
          return sessionDate >= fromDate && sessionDate <= toDate
          
        })
        
      }
      
      if(request.query.limit){
        responseObject = responseObject.slice(0, request.query.limit)
      }
      
      
      
      
      response.json({_id:data._id,username:data.username,count:data.log.length,log:responseObject});
    }
    
  })
  
  
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
