# My Health App
This project is a back-end API service built using Node.js and MongoDB. It provides various endpoints for managing users' health data with different schemas.

# Table of Contents
* Installation
* API Endpoints
    * Add Dummy Data to Government Server
    * Add Doctor to Doctors Schema
    * Register
    * Log In
    * Update User Info
    * Get User Information
    * Add Receipts
    * Get Receipts
    * Add Activities
    * Get Activities
    * Add Analyses
    * Get Analyses

## Installation
To run this project locally, follow these steps:


1. Clone the repository to your local machine:
```bash 
    git clone https://github.com/Eshgin1337/My-Health-API.git
    cd My-Health-API/
```

2. Install the project dependencies using npm:
```bash 
    npm install
```

 
3. Configure the MongoDB connection settings in the config.js file to match your environment.

4. Start the server:
```bash 
    node app.js
```

The server will be running at http://localhost:3000.


## API endpoints for interacting

### To add dummy data to government server
Required parameters: {firstName, middleName, lastName, fatherName, height, weight, age, FIN_CODE, phoneNumber} <br>
Link to make post request: http://localhost:3000/addtogov


### To add doctor to doctors schema
Required parameters: {FIN_CODE, medicalCenterName, field} <br>
Link to make post request: http://localhost:3000/adddoctor


### To register 
Required parameters: {FIN_CODE, phoneNumber, password} <br>
Link to make post request: http://localhost:3000/register


### To log in 
### You will be given a token that can be used for an hour
Required parameters: {FIN_CODE, password} <br>
Link to make post request: http://localhost:3000/login


### To update user info
#### By default user info will be empty, you will need to update it
Required parameters: {weight, height, badHabits(In arra form)} <br>
Link to make post request: http://localhost:3000/updateuserinfo


### To get user information including bad habits 
Required parameters: none <br>
Link to make post request: http://localhost:3000/getuserinfo


### To add reciepts 
#### You, by default, will not have any reciepts, you can add from here.
Required parameters: {doctor_fin, date (as a string), prescription(In array form)} <br>
Link to make post request: http://localhost:3000/addreciept


### To get reciepts 
Required parameters: none <br>
Link to make post request: http://localhost:3000/getreciepts


### To add activities 
#### You, by default, will not have any activities, you can add from here.
Required parameters: {numOfSteps, heartbeat, numOfMinutes, calories, sleepHours, distance} <br>
Link to make post request: http://localhost:3000/addactivity


### To get activities 
Required parameters: none <br>
Link to make post request: http://localhost:3000/getactivities


### To add analysis 
#### You, by default, will not have any analyses, you can add from here.
Required parameters: {name, status(enum type: ['tba', 'ready']), date(as a string), result(as a string)} <br>
Link to make post request: http://localhost:3000/addanalysis


### To get analyses 
Required parameters: none <br>
Link to make post request: http://localhost:3000/getanalyses