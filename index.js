const express = require("express");
const mongoose = require("mongoose");
const { polling } = require("./helper");
const cors = require("cors");
const app = express();
const instances = require('./models/instances');
const processes = require('./models/processes');

// Setting CORS options
const corsOptions = {
  origin: "*",
  methods: "*",
  allowedHeaders: "*",
};

app.use(cors(corsOptions));

// Setting port and database URL
const PORT = process.env.PORT || 8080;
const MONGO_DB_URL =
  process.env.MONGO_DB_URL || "mongodb://admin:admin@10.128.0.109:27017/projectDB";

mongoose
  .connect(MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log("mongodb connection failed", err);
  });

mongoose.connection.on('open', () => {
  instances.find({}, (err, i) => {
    if(err) console.log(err);
    else{
      console.log(i);
    }
  });
  processes.find({}, (err, p) => {
    if(err) console.log(err);
    else{
      console.log(p);
    }
  })
})


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

polling();

app.use("/api/server", require("./routes/api/server"));
app.listen(PORT, () => {console.log(`Main Server running on port ${PORT}`)});
