-- This file shows the setup of our postgres database

CREATE TABLE Person (
    person_id SERIAL PRIMARY KEY,
    person_name VARCHAR(50) NOT NULL
);

CREATE TABLE Administrator (
    admin_username VARCHAR(50) PRIMARY KEY,
    admin_password VARCHAR(50) NOT NULL,
    person_id INT NOT NULL,
    FOREIGN KEY (person_id) REFERENCES Person(person_id)
);

CREATE TABLE WordleUser (
    user_username VARCHAR(50) PRIMARY KEY,
    user_password VARCHAR(50) NOT NULL,
    person_id INT NOT NULL,
    FOREIGN KEY (person_id) REFERENCES Person(person_id)
);

CREATE TABLE Scoreboard (
    score_id SERIAL PRIMARY KEY,
    user_username VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    FOREIGN KEY (user_username) REFERENCES WordleUser(user_username)
);


-- Sample population for the DB is shown below with a student, teacher, and homework assignment

-- Create admin
WITH admin_sample AS (
    INSERT INTO Person (person_name) 
    VALUES ('Admin Adminson') 
    RETURNING person_id
)
INSERT INTO Administrator (admin_username, admin_password, person_id)
    VALUES ('admin', 'password', (select person_id from admin_sample));

-- Create user
WITH user_sample AS (
    INSERT INTO Person (person_name) 
    VALUES ('Michael OSullivan') 
    RETURNING person_id
) 
INSERT INTO WordleUser (user_username, user_password, person_id) 
    VALUES ('username', 'password', (select person_id from user_sample));