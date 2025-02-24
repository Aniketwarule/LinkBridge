const express = require('express')
const cors = require('cors')
const Auth = require('./routes/auth')
const mongoose = require('mongoose')
const Working = require('./routes/working');
const Post = require('./routes/post')
const Jobs = require("./routes/jobs");


const app = express();

app.use(express.json())
app.use(cors())

app.use('/auth', Auth.router)
app.use('/working', Working)
app.use('/post', Post)
app.use("/jobs", Jobs); 

mongoose.connect('mongodb+srv://aniketwarule775:CdJ1lRci5YIBItYZ@cluster0.szgy81i.mongodb.net/', { dbName: "course_selling_application" });


app.listen(3000, (req, res) => {
    console.log('Server started on port 3000');
})
