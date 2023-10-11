let express=require('express');
var cors = require('cors')
const app=express();
const Downloadrouter=require('./routes/downloadrouter')
app.use(cors({
  origin:"*",
  methods:["GET","POST","DELETE"],
  credentials:true,

}))
app.use(Downloadrouter) 



app.listen(5000, () => {
    console.log(`connected to 5000`);
  });
  