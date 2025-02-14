CREATE TABLE IF NOT EXISTS Experiment
(
    ExperimentID serial PRIMARY KEY,
    Name varchar(100) NOT NULL,
    Description varchar(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS PhotoLab
(
    PhotoLabID serial PRIMARY KEY,
    ExperimentID int REFERENCES Experiment(ExperimentID),
    Path varchar(100) NOT NULL,
    Captions varchar(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Session
(
    SessionID serial PRIMARY KEY,
    ExperimentID int REFERENCES Experiment(ExperimentID),
    SessionCode varchar(100) NOT NULL,
    RoomCode varchar(100) NOT NULL,
    HostSocketID varchar(100) NOT NULL,
    Users JSON ARRAY,
    isInitialized BOOLEAN NOT NULL,
    Configuration JSON NOT NULL,
    Credentials JSON,
    DiscoveredDevices JSON ARRAY,
    SessionAvailable BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS AssociatedDevice
(
    AssociatedDevice serial PRIMARY KEY,
    IPAddress varchar(100) NOT NULL,
    SerialNumber varchar(100) NOT NULL,
    SocketDeviceID varchar(100) NOT NULL,
    SamplingFrequency int NOT NULL DEFAULT 50,
    FrontEndSocketID varchar(100) NOT NULL,
    IsAvailable BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS "User"
(
    UserID serial PRIMARY KEY,
    Name varchar(100) NOT NULL,
    AssociatedDevice int REFERENCES AssociatedDevice(AssociatedDevice),
    SessionID int REFERENCES Session(SessionID),
    ExpirationData int NOT NULL DEFAULT 50
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
    DataFrameID serial PRIMARY KEY,
    AncDataFrameID integer REFERENCES AncilliaryDataFrame(AncilliaryDataFrameID),
    AuxDataFrameID integer REFERENCES AuxilliaryDataFrame(AuxilliaryDataFrameID),
    RecordingID int REFERENCES Recording(RecordingID),
    Timestamp int NOT NULL
);

