const express = require('express')
const app = express()
const mongoose = require('mongoose')
const PORT = 5000
const {MONGOURI} = require('./keys')




mongoose.connect(MONGOURI,{
    // useNewUrlParser: true,
    // useUnifiedTopology: true  useUnifiedTopology has no effect since Node.js Driver version 4.0.0 and will be removed in the next major version
})
mongoose.connection.on('connected',()=>{
    console.log("Connected to Mongoose")
})
mongoose.connection.on('error',(err)=>{
    console.log("err connecting",err)
})

require('./models/user')
require('./models/post')

app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))


app.listen(PORT,()=>{
    console.log("server is running on port",PORT)
})