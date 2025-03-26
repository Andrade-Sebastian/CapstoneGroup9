

--Author: Emanuelle Pelayo
--Purpose: Create the database


--Done Refactoring
CREATE TABLE IF NOT EXISTS Experiment
(
    ExperimentID serial PRIMARY KEY, --Nullable
    Name varchar(100) NOT NULL,
    Description varchar(255) --Nullable
);

--Done Refactoring
CREATE TABLE IF NOT EXISTS PhotoLab
(
    PhotoLabID serial PRIMARY KEY,
    ExperimentID int REFERENCES Experiment(ExperimentID),
    Path varchar(100) NOT NULL,
    Captions varchar(100) --Nullable
);

--Done Refactoring
CREATE TABLE IF NOT EXISTS Session
(
    SessionID serial PRIMARY KEY,
    ExperimentID int REFERENCES Experiment(ExperimentID),
    RoomCode varchar(100) NOT NULL,
    HostSocketID varchar(100) NOT NULL,
    StartTimestamp TIMESTAMP, --Nullable
    isPasswordProtected BOOLEAN,
    Password VARCHAR(255), --Nullable
    isSpectatorsAllowed BOOLEAN,
    EndTimestamp TIMESTAMP --Nullable
);

--Done Refactoring
CREATE TABLE IF NOT EXISTS Device
(
    DeviceID serial PRIMARY KEY,
    IPAddress varchar(100) NOT NULL,
    SerialNumber varchar(100) NOT NULL,
    DeviceSocketID varchar(100) NOT NULL,
    SamplingFrequency int NOT NULL DEFAULT 50, --Change if needed
    IsAvailable BOOLEAN NOT NULL,
    IsConnected BOOLEAN --nullable
);


CREATE TABLE IF NOT EXISTS "User"
(
    UserID serial PRIMARY KEY,
    Nickname varchar(100) NOT NULL,
    Device int REFERENCES Device(DeviceID), --nullable
    SessionID int REFERENCES Session(SessionID),
    isMasked BOOLEAN,
    FrontendSocketID VARCHAR(100),
    LeftSession TIMESTAMP, --nullable
    UserRole VARCHAR(100),
    Secret VARCHAR(100)
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
    Path VARCHAR(100)
);

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

CREATE TABLE IF NOT EXISTS ArticleLab
(
    ArticleLabID serial PRIMARY KEY,
    ExperimentID int REFERENCES Experiment(ExperimentID),
    Path varchar(100) NOT NULL
);