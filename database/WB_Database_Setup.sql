CREATE TABLE IF NOT EXISTS Experiment
(
    ExperimentID serial PRIMARY KEY,
    Name varchar(25) NOT NULL,
    Description varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS PhotoLab
(
    PhotoLabID serial PRIMARY KEY,
    ExperimentID int REFERENCES Experiment(ExperimentID),
    Path varchar(25) NOT NULL,
    Captions varchar(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Session
(
    SessionID serial PRIMARY KEY,
    ExperimentID int REFERENCES Experiment(ExperimentID),
    BESessionID varchar(25) NOT NULL,
    RoomCode varchar(10) NOT NULL,
    HostSocketID varchar(25) NOT NULL,
    Users JSON ARRAY,
    isInitialized BOOLEAN NOT NULL,
    Configuration JSON NOT NULL,
    Credentials JSON,
    DiscoveredDevices JSON ARRAY
);

CREATE TABLE IF NOT EXISTS User
(
    UserID serial PRIMARY KEY,
    Name varchar(25) NOT NULL,
    AssociatedDevice int REFERENCES AssociatedDevice(AssociatedDevice),
    SessionID int REFERENCES Session(SessionID),
    ExpirationData int NOT NULL DEFAULT 50
);

CREATE TABLE IF NOT EXISTS AssociatedDevice
(
    AssociatedDevice serial PRIMARY KEY,
    IPAddress varchar(25) NOT NULL,
    SerialNumber varchar(25) NOT NULL,
    SocketDeviceID varchar(25) NOT NULL,
    SamplingFrequency int NOT NULL DEFAULT 50
);

CREATE TABLE IF NOT EXISTS AncilliaryDataFrame
(
    AncilliaryDataFrameID serial PRIMARY KEY,
    Package int,
    EDA numeric,
    Temperature numeric,
    Thermistor numeric
);

CREATE TABLE IF NOT EXISTS AuxilliaryDataFrame
(
    AuxilliaryDataFrameID serial PRIMARY KEY,
    Package int,
    PPG_Red numeric,
    PPG_InfaRed numeric,
    PPG_Green numeric
);

CREATE TABLE IF NOT EXISTS Recording
(
    RecordingID serial PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS IntersectionTable
(
    DataFrameID serial PRIMARY KEY
    AncDataFrameID integer REFERENCES AncilliaryDataFrame(AncilliaryDataFrameID),
    AuxDataFrameID integer REFERENCES AuxilliaryDataFrame(AuxDataFrameID),
    RecordingID int REFERENCES Recording(RecordingID),
    Timestamp int NOT NULL
);