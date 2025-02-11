
--Author: Emanuelle Pelayo
--Purpose: Create the database


--Done Refactoring
CREATE TABLE IF NOT EXISTS Experiment
(
    ExperimentID serial PRIMARY KEY,
    Name varchar(25) NOT NULL,
    Description varchar(255) --Nullable
);

--Done Refactoring
CREATE TABLE IF NOT EXISTS PhotoLab
(
    PhotoLabID serial PRIMARY KEY,
    ExperimentID int REFERENCES Experiment(ExperimentID),
<<<<<<< HEAD
    Path varchar(25) NOT NULL,
    Captions varchar(100) --Nullable
=======
    Path varchar(100) NOT NULL,
    Captions varchar(100) NOT NULL
);
CREATE TABLE IF NOT EXISTS VideoLab
(
    VideoLabID serial PRIMARY KEY,
    ExperimentID int REFERENCES Experiment(ExperimentID),
    Path varchar(100) NOT NULL,
);
CREATE TABLE IF NOT EXISTS GalleryLab
(
    GalleryLabID serial PRIMARY KEY,
    ExperimentID int REFERENCES Experiment(ExperimentID),
    Path varchar(100) NOT NULL,
    Captions varchar(100) NOT NULL
>>>>>>> 929415e603e9073c673b61c4ce898e4131ec3a18
);

--Done Refactoring
CREATE TABLE IF NOT EXISTS Session
(
    SessionID serial PRIMARY KEY,
    ExperimentID int REFERENCES Experiment(ExperimentID),
    RoomCode varchar(10) NOT NULL,
    HostSocketID varchar(25) NOT NULL,
    StartTimestamp TIMESTAMP, --Nullable
    isPasswordProtected BOOLEAN,
    Password VARCHAR(25), --Nullable
    isSpectatorsAllowed BOOLEAN,
    EndTimestamp TIMESTAMP --Nullable
);

--Done Refactoring
CREATE TABLE IF NOT EXISTS Device
(
    DeviceID serial PRIMARY KEY,
    IPAddress varchar(25) NOT NULL,
    SerialNumber varchar(25) NOT NULL,
    DeviceSocketID varchar(25) NOT NULL,
    SamplingFrequency int NOT NULL DEFAULT 50, --Change if needed
    IsAvailable BOOLEAN NOT NULL,
    IsConnected BOOLEAN --nullable
);


CREATE TABLE IF NOT EXISTS "User"
(
    UserID serial PRIMARY KEY,
    Nickname varchar(25) NOT NULL,
    Device int REFERENCES Device(DeviceID), --nullable
    SessionID int REFERENCES Session(SessionID),
    isMasked BOOLEAN,
    FrontendSocketID VARCHAR(25),
    LeftSession TIMESTAMP, --nullable
    UserRole VARCHAR(25),
    Secret VARCHAR(25)
);

--Done Refactoring
CREATE TABLE IF NOT EXISTS AncillaryDataFrame
(
    AncillaryDataFrameID serial PRIMARY KEY,
    Package int,
    EDA numeric,
    Temperature numeric,
    Thermistor numeric
);

--Done Refactoring
CREATE TABLE IF NOT EXISTS AuxiliaryDataFrame
(
    AuxDataFrameID serial PRIMARY KEY,
    Package int,
    PPG_Red numeric,
    PPG_InfraRed numeric,
    PPG_Green numeric
);

--Done Refactoring
CREATE TABLE IF NOT EXISTS Recording
(
    RecordingID serial PRIMARY KEY,
    ExpirationTimestamp TIMESTAMP
);

--Done Refactoring
CREATE TABLE IF NOT EXISTS RecordingDataPoint
(
    DataFrameID serial PRIMARY KEY,
    UserID SERIAL REFERENCES "User" (UserID),
    AncDataFrameID integer REFERENCES AncillaryDataFrame(AncillaryDataFrameID),
    AuxDataFrameID integer REFERENCES AuxiliaryDataFrame(AuxDataFrameID),
    RecordingID int REFERENCES Recording(RecordingID),
    Timestamp TIMESTAMP
);


--Done Refactoring
CREATE TABLE IF NOT EXISTS VideoLab
(
    VideoLabID SERIAL PRIMARY KEY,
    ExperimentID SERIAL REFERENCES Experiment(ExperimentID),
    Path VARCHAR(25)
);


--Done Refactoring
CREATE TABLE IF NOT EXISTS GalleryLab
(
    GalleryLabID INTEGER PRIMARY KEY,
    ExperimentID INTEGER REFERENCES Experiment(ExperimentID),
    Filename VARCHAR(256),
    Path VARCHAR(256),
    Caption VARCHAR(512),
    TimeShown INTEGER,
    ImageOrder INTEGER
);

