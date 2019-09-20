const { Client } = require('pg');
const dotenv = require('dotenv').config();

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = 'AAAdmin';
db_credentials.host = 'database-structures.csjve6pmlqxu.us-east-2.rds.amazonaws.com';
db_credentials.database = 'aa';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

var query = "";

// Sample SQL statement to delete a table: 
// query += "DROP TABLE if exists types cascade;";
// query += "DROP TABLE if exists events cascade;";
// query += "DROP TABLE if exists groups cascade;";
// query += "DROP TABLE if exists locations cascade;";


// SQL statement to create a table: 
query += "CREATE TABLE locations (Location_ID serial primary key,\
                                    Location_Name varchar(100),\
                                    Address_Line_1 varchar(100),\
                                    City varchar(100),\
                                    State varchar(100),\
                                    Zipcode smallint,\
                                    Accessible BOOL,\
                                    Extended_Address varchar(200),\
                                    lat double precision,\
                                    long double precision,\
                                    Zone smallint);";

query += "CREATE TABLE groups (Group_ID serial primary key,\
                                Location_ID int references locations(Location_ID),\
                                Address_Line_1 varchar(100),\
                                Group_Name varchar(100),\
                                Details varchar(100));";

query += "CREATE TABLE types (Type_ID serial primary key,\
                                Description varchar(100));";
                                    
query += "CREATE TABLE events (Event_ID serial primary key,\
                                Group_ID int references groups(Group_ID),\
                                Day varchar(100),\
                                Start_at time,\
                                End_at time,\
                                Type_ID int references types(Type_ID),\
                                Details varchar(100));";
 
// Check Schema                               
// query = 'SELECT * FROM INFORMATION_SCHEMA.COLUMNS';

//run query
client.query(query, (err, res) => {
    console.log(err, res);
    client.end();
});

