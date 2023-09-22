require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
const validator = (req, res, next) => {
    var token = req.headers.token;
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=> {
        if (err) {
          res.status(403).send({ success: false, message: "Failed to authenticate user." })
        } else {
          req.decoded = decoded
          next()
        }
      })
    } else {
      res.status(403).send({ success: false, message: "No Token Provided." })
    }
};


mongoose.connect(`mongodb://localhost:27017/myhealthapp`);

const citizenSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    middleName: {type: String, required: false},
    lastName: {type: String, required: true},
    fatherName: {type: String, required: true},
    height: {type: Number, required: true},
    weight: {type: Number, required: true},
    age: {type: Number, required: true},
    FIN_CODE: {type: String, required: true, unique: true},
    phoneNumber: {type: String, required: true, unique: true}
});



const userInfoSchema = new mongoose.Schema({
    FIN_CODE: {type: String, required: true, unique: true},
    weight: {type: Number, required: true},
    height: {type: Number, required: true},
    badHabits: {type: Array, required: false}
});

const activitySchema = new mongoose.Schema({
    FIN_CODE: {type: String, required: true, unique: true},
    numOfSteps: {type: Number, required: true},
    heartbeat: {type: Number, required: true},
    numOfMinutes: {type: Number, required: true},
    calories: {type: Number, required: true},
    sleepHours: {type: Number, required: true},
    distance: {type: Number, required: true},
});

const analysisSchema = new mongoose.Schema({
    FIN_CODE: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    status: 
        {
            type: String, 
            enum: {
                values: ['tba', 'ready'],
                message: '{VALUE} is not supported'
            }
        },
    date: {type: String},
    result: {
                type: String, 
                required: false
            }
});


const doctorSchema = new mongoose.Schema({
    FIN_CODE: {type: String, required: true, unique: true},
    firstName: {type: String, required: true},
    middleName: {type: String, required: false},
    lastName: {type: String, required: true},
    medicalCenterName: {type: String, required: true},
    field: {type: String, required: true}
});


const registeredUsersSchema = new mongoose.Schema({
    FIN_CODE: {type: String, required: true, unique: true},
    phoneNumber: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});


const eReseptModelSchema = new mongoose.Schema({
    patient_fin: {type: String, required: true, unique: true},
    doctor_fin: {type: String, required: true, unique: true},
    medicalCenterName: {type: String, required: true}, 
    date: {type: String, required: true},
    prescription: Array
});


const Citizen = mongoose.model('Citizen', citizenSchema);
const registeredUser = mongoose.model('registeredUser', registeredUsersSchema);
const userInfo = mongoose.model('userInfo', userInfoSchema);
const Activity = mongoose.model('activity', activitySchema);
const Analysis = mongoose.model('Analysis', analysisSchema);
const eResept = mongoose.model('eResept', eReseptModelSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);


app.post('/addtogov', async function (req, res) {
    const {firstName, middleName, lastName, fatherName, height, weight, age, FIN_CODE, phoneNumber} = req.query;
    const citizen = new Citizen({
        firstName: firstName,
        middleName: middleName,
        lastName, lastName,
        fatherName: fatherName,
        height: height,
        weight: weight,
        age: age, 
        FIN_CODE: FIN_CODE,
        phoneNumber: phoneNumber
    });
    await citizen.save();
    res.send(citizen);
});


app.post('/adddoctor', function (req, res) {
    const {FIN_CODE, medicalCenterName, field} = req.query;
    Citizen.findOne({FIN_CODE: FIN_CODE}, function (err, result) {
        if (!err) {
            if (result) {
                const doctor = new Doctor({
                    FIN_CODE: FIN_CODE,
                    firstName: result.firstName,
                    middleName: result.middleName,
                    lastName: result.lastName,
                    medicalCenterName: medicalCenterName,
                    field: field
                });
                doctor.save(function (err) {
                    if (err) {
                        res.status(403).json('cannot add data');
                    } else {
                        res.json({'msg': 'successfully added'});
                    }
                });
            } else {
                res.status(404).json({'msg': 'This person does not exist in goverment database!'})
            }
        }
    })
    
})


app.post('/register', async function (req, res) {
    const {FIN_CODE, phoneNumber, password} = req.query;
    if (FIN_CODE === null || phoneNumber === null || password === null) {
        return res.status(400).send('Please provide all values')
    }
    if (password.length < 4) {
        return res.status(403).send('Password length should be at least 4 characters');
    }
    Citizen.findOne({FIN_CODE:FIN_CODE}, async function (err, foundUser) {
        if (err) return res.json(err);
        if (foundUser) {
            registeredUser.findOne({FIN_CODE: FIN_CODE}, async function (err, exists) {
                if (err) return res.json(err);
                if (exists) {
                    res.status(401).json({'error': 'This user has already been registered'});
                } else {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const newUser = new registeredUser({
                        FIN_CODE: FIN_CODE,
                        phoneNumber: foundUser.phoneNumber,
                        password: hashedPassword
                    });
                    await newUser.save();
                    const tokenIngredient = {
                        fin_code: FIN_CODE
                    }
                    const token = jwt.sign(tokenIngredient, process.env.JWT_SECRET, {
                            algorithm: "HS256",
                            expiresIn: 3600,
                        });
                    const userData = {token: token, user: foundUser};
                    res.json(userData);
                }
            });
            
        } else {
            res.json({'error': 'There is no existing person amoung citizens'});
        }
    });
});


app.post('/login', function (req, res) {
    const {FIN_CODE, password} = req.query;
    registeredUser.findOne({FIN_CODE: FIN_CODE}, function (err, found) {
        if (err) return res.json(err);
        if (!found) {
            return res.status(404).json({'error': 'This user has not been registered yet!'});
        } else {
            bcrypt.compare(password, found.password, function (err, match) {
                if (err) return res.json(err);
                if (match) {
                    Citizen.findOne({FIN_CODE: FIN_CODE}, function (err, user) {
                        console.log(user.FIN_CODE);
                        let tokenIngredient = {
                            fin_code: user.FIN_CODE
                        }
                        const token = jwt.sign(tokenIngredient, process.env.JWT_SECRET, {
                            algorithm: "HS256",
                            expiresIn: 3600,
                        });
                        const userData = {token: token, user: user};
                        res.json(userData);
                    })
                } else {
                    return res.json({'error': 'This password is incorrect'});
                }
            })
        }
    });
});


app.post('/updateuserinfo', validator, function (req, res) {
    const userFin = req.decoded.fin_code;
    const {weight, height, badHabits} = req.query;
    userInfo.findOne({FIN_CODE: userFin}, function (err, user) {
        if (err) res.status(403).json({'msg': 'There is an error please check and try again'});
        if (user){
            user.weight = weight;
            user.height = height;
            user.badHabits = badHabits;
            user.save(function (err) {
                if (err) {
                    res.status(403).json('cannot add data');
                } else {
                    res.json({'msg': 'successfully added'});
               }
             });
        } else {
            const newUserInfo = new userInfo({
                FIN_CODE: userFin,
                weight: weight,
                height: height,
                badHabits: badHabits
            });
            newUserInfo.save(function (err) {
                if (err) {
                    res.status(403).json('cannot add data');
                } else {
                    res.json({'msg': 'successfully added'});
               }
             });
        }
    });
});


app.get('/getuserinfo', validator, function (req, res) {
    const userFin = req.decoded.fin_code;
    userInfo.findOne({FIN_CODE: userFin}, function (err, user) {
        if (err) res.status(403).json({'msg': 'There is an error please check and try again'});
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({'msg': 'The user info has not been added yet'});
        }
    })
})


app.post('/addreciept', validator, function (req, res) {
    const userFin = req.decoded.fin_code;
    const {doctor_fin, date, prescription} = req.query;
    Doctor.findOne({FIN_CODE: userFin}, function (err, doctor) {
        if (err) res.status(403).json({'msg': 'There is an error please check and try again'});
        if (doctor) {
            console.log(doctor);
            const reciept = new eResept({
                patient_fin: userFin,
                doctor_fin: doctor_fin, 
                medicalCenterName: doctor.medicalCenterName,
                date: date,
                prescription: prescription
            });
            reciept.save(function (err) {
                if (err) {
                    res.status(403).json('cannot add data');
                } else {
                    res.json({'msg': 'successfully added'});
                }
            });
        } else {
            res.status(401).json({'msg': 'There is no such a doctor yet'});
        }
    })
    const reciept = new eResept({
        patient_fin: userFin,
        doctor_fin: doctor_fin, 
        medicalCenterName: medicalCenterName,
        date: date,
        prescription: prescription
    });
    reciept.save(function (err) {
        if (err) {
            res.status(403).json('cannot add data');
        } else {
            res.json({'msg': 'successfully added'});
        }
    });
});


app.get('/getreciepts', validator, function (req, res) {
    const userFin = req.decoded.fin_code;
    eResept.find({FIN_CODE: userFin}, function (err, result) {
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({'msg': 'No reciepts yet!'});
        }
    })
})


app.post('/addactivity', validator, function (req, res) {
    const userFin = req.decoded.fin_code;
    const {numOfSteps, heartbeat, numOfMinutes, calories, sleepHours, distance} = req.query;
    const activity = new Activity({
        FIN_CODE: userFin,
        numOfSteps: numOfSteps,
        heartbeat: heartbeat,
        numOfMinutes: numOfMinutes,
        calories: calories,
        sleepHours: sleepHours,
        distance: distance
    });
    activity.save(function (err) {
        if (err) {
            res.status(403).json('cannot add data');
        } else {
            res.json({'msg': 'successfully added'});
        }
    })
});


app.get('/getactivities', validator, function (req, res) {
    const userFin = req.decoded.fin_code;
    Activity.find({FIN_CODE: userFin}, function (err, result) {
        if (!err) {
            if (result) {
                res.json(result);
            } else {
                res.status(404).json({'msg': 'You have not add any activity yet'});
            }
        }
    })
});


app.post('/addanalysis', validator, function (req, res) {
    const userFin = req.decoded.fin_code;
    const {name, status, date, result} = req.query;
    const analysis = new Analysis({
        FIN_CODE: userFin,
        name: name,
        status: status,
        date: date,
        result: result
    });
    analysis.save(function (err) {
        if (err) {
            res.status(403).json('cannot add data');
        } else {
            res.json({'msg': 'successfully added'});
        }
    });
});


app.get('/getanalyses', validator, function (req, res) {
    const userFin = req.decoded.fin_code;
    Analysis.find({FIN_CODE: userFin}, function (err, analyses) {
        if (!err) {
            if (patient) {
                res.json(analyses);
            } else {
                res.status(404).json({'msg': 'no analyses yet'});
            }
        }
    })
});


app.listen(3000, function () {
    console.log('Server has started on port 3000');
});

