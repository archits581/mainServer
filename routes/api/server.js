const axios = require("axios");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcrypt");
const { verifyToken, getSummary } = require("../../helper");

const instances = require("../../models/instances");
const processes = require("../../models/processes");
const servers = require("../../models/servers");
const users = require("../../models/users");


// Instances Status Endpoint - Fetches all instances from the database depending on the Level of Control
router.get("/processes/status", verifyToken, async (req, res) => {
  jwt.verify(req.token, "jwtSecret", (err, authData) => {
    if (err) {
      res.status(500).send({ msg: err });
    }
    processes.find(
      { designationIds: parseInt(authData.data.designationId) },
      (err, data) => {
        if (err) {
          res.status(500).send({ msg: err });
        }
        let names = data.map((row) => row.processName);

        instances
          .find({ processName: { $in: names } })
          .populate("serverId")
          .sort({ startTime: -1 })
          .exec((error, d) => {
            if (error) {
              res.status(500).send({ msg: error });
            }
            res.status(200).send(d);
          });
      }
    );
  });
});

// Get details for summary page
router.get("/processes/summary", verifyToken, async (req, res) => {
  jwt.verify(req.token, "jwtSecret", async (err, authData) => {
    if (err) {
      res.status(500).send({ msg: err });
    }
    let result = await getSummary();

    res.status(200).send(result);
  });
  res.status(403);
});

// Start Process Instance Endpoint
router.post("/processes/start", verifyToken, (req, res) => {
  jwt.verify(req.token, "jwtSecret", (err, authData) => {
    if (err) {
      res.status(403).send({ msg: err });
    }
    let processName = req.body.pname;
    let serverIpAddress = req.body.sip;
    let serverPort = req.body.port;
    console.log(`http://${serverIpAddress}/api/internal/processes/start`);
    axios
      .post(`http://${serverIpAddress}/api/internal/processes/start`, {
        pname: processName,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((response) => {
        res.send("Process started sucessfully.");
      })
      .catch((error) => {
        res.status(403).send({ msg: error });
      });
  });
});

// Stop Process Instance endpoint
router.post("/processes/stop", verifyToken, (req, res) => {
  jwt.verify(req.token, "jwtSecret", (err, authData) => {
    if (err) {
      res.status(403).send({ msg: err });
    }
    const osId = req.body.osId;
    const serverIp = req.body.serverIp;
    const serverPort = req.body.serverPort;
    console.log(`http://${serverIp}/api/internal/processes/stop`);
    axios
      .post(`http://${serverIp}/api/internal/processes/stop`, {
        osId: osId,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((response) => {
        console.log(response.data);
        res.status(200).send("Process stopped");
      })
      .catch((error) => {
        res.status(403).send({ msg: error });
      });
  });
});

// Login endpoint
router.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  users.findOne({ username: username }, async (err, data) => {
    if (err) {
      res.status(403).send({ msg: err });
    }
    let validPassword = await bcrypt.compare(password, data.password);
    if (validPassword) {
      jwt.sign({ data }, "jwtSecret", { expiresIn: 3600 }, (error, token) => {
        if (error) {
          res.status(403).send({ msg: error });
        }
        const user = {
          token: token,
          username: data.username,
          password: data.password,
          designationId: data.designationId,
          lastLogin: data.lastLogin,
        };
        
        // var currentTime = new Date();
        // var ISTOffset = 330;
        // var currentOffset = currentTime.getTimezoneOffset();
        data.lastLogin = Date.now();
        data.save();
        res.status(200).send(user);
      });
    } else {
      res.status(400).send({ msg: "Incorrect Credentials" });
    }
  });
});

// ProcessList Endpoint
router.get("/processes/processList", async (req, res) => {
  await processes.find({}).exec((err, data) => {
    if (err) {
      res.status(500).send({ msg: err });
    }
    res.status(200).send(data);
  });
  res.status(503);
});

// ServerList endpoint
router.get("/processes/serverList", async (req, res) => {
  await servers.find({}).exec((err, data) => {
    if (err) {
      res.status(500).send({ msg: err });
    }
    res.status(200).send(data);
  });
  res.status(503);
});

router.post("/populate", async (req, res) => {
  // let newUser = {
  //   username: "Admin",
  //   password: "$2b$05$S1IMnHLOM81YTEd4IUMkFOqdUEp3RxcNodkWt9LgAQ/3Xx9tLzR7i",
  //   designationId: "1",
  // };
  // let userObject = new users(newUser);
  // userObject.save((err, user) => {
  //   if (err) {
  //     res.status(503).send({ msg: err });
  //   }
  // });
  // let p1 = {
  //   designationIds: [1, 2, 3],
  //   processName: "Change_Severity.py",
  // };

  // let p2 = {
  //   designationIds: [1, 2],
  //   processName: "Clean_Database.py",
  // };

  // let p3 = {
  //   designationIds: [1, 2, 3],
  //   processName: "Clear_Closed_Events.py",
  // };

  // processes.create(p1);
  // processes.create(p2);
  // processes.create(p3);

  let s1 = {
    serverName: "dev-server-1",
    ipAddress: "process-server-1-process-server-1.apps.123.252.203.198.nip.io",
    port: "8080",
    processIds: [
      "610a6e7a691612001a2f3e46",
      "610a6e7a691612001a2f3e47",
      "610a6e7a691612001a2f3e48",
    ],
  };

  let s2 = {
    serverName: "dev-server-2",
    ipAddress: "process-server-2-process-server-2.apps.123.252.203.198.nip.io",
    port: "8080",
    processIds: [
      "610a6e7a691612001a2f3e46",
      "610a6e7a691612001a2f3e47",
      "610a6e7a691612001a2f3e48",
    ],
  };

  servers.create(s1);
  servers.create(s2);

  
  res.status(200).send({ msg: "Populated database successfully" });
});

module.exports = router;
