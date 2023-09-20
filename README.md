# API endpoints for interacting

## To add dummy data to government server
Required parameters: {firstName, middleName, lastName, fatherName, height, weight, age, FIN_CODE, phoneNumber}
Link to make post request: http://localhost:3000/addtogov


## To add doctor to doctors schema
Required parameters: {FIN_CODE, medicalCenterName, field}
Link to make post request: http://localhost:3000/adddoctor


## To register 
Required parameters: {FIN_CODE, phoneNumber, password}
Link to make post request: http://localhost:3000/register


## To log in 
### You will be given a token that can be used for an hour
Required parameters: {FIN_CODE, password}
Link to make post request: http://localhost:3000/login


## To update user info
### By default user info will be empty, you will need to update it
Required parameters: {weight, height, badHabits(In arra form)}
Link to make post request: http://localhost:3000/updateuserinfo


## To get user information including bad habits 
Required parameters: none
Link to make post request: http://localhost:3000/getuserinfo


## To add reciepts 
### You, by default, will not have any reciepts, you can add from here.
Required parameters: {doctor_fin, date (as a string), prescription(In array form)}
Link to make post request: http://localhost:3000/addreciept


## To get reciepts 
Required parameters: none
Link to make post request: http://localhost:3000/getreciepts


## To add activities 
### You, by default, will not have any activities, you can add from here.
Required parameters: {numOfSteps, heartbeat, numOfMinutes, calories, sleepHours, distance}
Link to make post request: http://localhost:3000/addactivity


## To get activities 
Required parameters: none
Link to make post request: http://localhost:3000/getactivities


## To add analysis 
### You, by default, will not have any analyses, you can add from here.
Required parameters: {name, status(enum type: ['tba', 'ready']), date(as a string), result(as a string)}
Link to make post request: http://localhost:3000/addanalysis


## To get analyses 
Required parameters: none
Link to make post request: http://localhost:3000/getanalyses