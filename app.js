let express=require('express');

const app=express();
const Downloadrouter=require('./routes/downloadrouter')

app.use(Downloadrouter) 



app.listen(5000, () => {
    console.log(`connected to 5000`);
  });
  