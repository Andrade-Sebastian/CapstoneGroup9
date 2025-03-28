--Author: Emanuelle Pelayo
--Procedures & Functions for the following database functions:
	-- 1. Checking if a session is available
	-- 2. Getting a Session instance with its users
	-- 3. Updating the availability status of a device
	-- 4. Getting all users in a session
	-- 5. Getting the state of a session
    -- 6. Joining a session as a student 
    -- 7. Joining a session as a spectator (without an EmotiBit)


-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS Check_Session_Availability(VARCHAR(100));
DROP FUNCTION IF EXISTS Get_Session_Mappings(INT);
DROP FUNCTION IF EXISTS Update_Device_Availability(INT, BOOL);
DROP FUNCTION IF EXISTS Get_Session_Users(INT);
DROP FUNCTION IF EXISTS Create_Session(VARCHAR(100), VARCHAR(100), BOOLEAN, VARCHAR(100), BOOLEAN);
DROP FUNCTION IF EXISTS Join_Session(VARCHAR(100), VARCHAR(100), TEXT, VARCHAR(100), TEXT, INT);
DROP FUNCTION IF EXISTS Join_Session_Without_EmotiBit(VARCHAR(100), VARCHAR(100), TEXT, VARCHAR(100));
DROP FUNCTION IF EXISTS Remove_Session(sessionid INT);


-- Create_Session
CREATE OR REPLACE FUNCTION Create_Session(
    room_code VARCHAR(100),
    host_socket_id VARCHAR(100),
    is_password_protected BOOLEAN,
    "password" VARCHAR(255),
    is_spectators_allowed BOOLEAN
)
RETURNS TABLE (
    sessionid INT,
    experimentid INT,
    roomcode VARCHAR(100),
    hostsocketid VARCHAR(100),
    starttimestamp TIMESTAMP,
    ispasswordprotected BOOLEAN,
    isspectatorsallowed BOOLEAN,
    endtimestamp TIMESTAMP
) AS $$
BEGIN
    -- Insert the new session
    INSERT INTO session(
        roomcode, hostsocketid, starttimestamp, ispasswordprotected, password, isspectatorsallowed, endtimestamp
    ) 
    VALUES (
        room_code, 
        host_socket_id,
        NULL, -- starttimestamp
        is_password_protected, 
        password, 
        is_spectators_allowed, 
        NULL -- endtimestamp
    );

    RETURN QUERY
    SELECT session.sessionid, session.experimentid, session.roomcode, session.hostsocketid, 
           session.starttimestamp, session.ispasswordprotected, session.isspectatorsallowed, session.endtimestamp 
    FROM session
    WHERE session.roomcode = room_code;
END;
$$ LANGUAGE plpgsql;

-- Check_Session_Availability
CREATE OR REPLACE FUNCTION Check_Session_Availability(room_code VARCHAR(100))
RETURNS TABLE (
    sessionid INT,
    experimentid INT,
    roomcode VARCHAR(100),
    hostsocketid VARCHAR(100),
    starttimestamp TIMESTAMP,
    ispasswordprotected BOOLEAN,
    isspectatorsallowed BOOLEAN,
    endtimestamp TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT session.sessionid, session.experimentid, session.roomcode, session.hostsocketid,
           session.starttimestamp, session.ispasswordprotected, session.isspectatorsallowed, session.endtimestamp
    FROM session
    WHERE session.roomcode = room_code AND session.endtimestamp IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Get_Session_Users
CREATE OR REPLACE FUNCTION Get_Session_Users(session_id INT)
RETURNS TABLE (
    userid INT, 
    nickname VARCHAR(100),
    device INT, 
    sessionid INT, 
    ismasked BOOL,
    frontendsocketid VARCHAR(100),
    leftsession TIMESTAMP, 
    userrole VARCHAR(100),
    secret VARCHAR(100) 
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM "User" WHERE "User".sessionid = session_id;
END;
$$ LANGUAGE plpgsql;

-- Update_Device_Availability
CREATE OR REPLACE FUNCTION Update_Device_Availability(device_id INT, is_available BOOL)
RETURNS TABLE (
    deviceid INT, 
    ipaddress VARCHAR(100),
    serialnumber VARCHAR(100),
    devicesocketid VARCHAR(100),
    samplingfrequency INT, 
    isavailable BOOL,
    isconnected BOOL
) AS $$
BEGIN
    -- Update device availability
    UPDATE device SET isavailable = is_available WHERE device.deviceid = device_id;

    RETURN QUERY 
    SELECT device.deviceid, device.ipaddress, device.serialnumber, device.devicesocketid, 
           device.samplingfrequency, device.isavailable, device.isconnected 
    FROM device 
    WHERE device.deviceid = device_id;
END;
$$ LANGUAGE plpgsql;

-- Join_Session
CREATE OR REPLACE FUNCTION Join_Session(
    param_nickname VARCHAR(100), 
    socket_id VARCHAR(100), 
    room_code TEXT, 
    user_role VARCHAR(100), 
    sn_four_digits TEXT,
    device_id INT
)
RETURNS TABLE (
    joiner_userid INT, 
    joiner_nickname VARCHAR(100), 
    joiner_sessionid INT, 
    joiner_ismasked BOOL, 
    joiner_frontendsocketid VARCHAR(100), 
    joiner_leftsession TIMESTAMP, 
    joiner_userrole VARCHAR(100)
) AS $$
DECLARE 
    found_session_id INT;
    user_id INT;
BEGIN
    -- Get session ID
    SELECT sessionid INTO found_session_id 
    FROM session WHERE roomcode = room_code 
    AND endtimestamp IS NULL LIMIT 1;

    IF found_session_id IS NULL THEN
        RAISE EXCEPTION 'No session found for RoomCode: %', room_code;
    END IF;

    -- Create a User
    INSERT INTO "User" (
        nickname, device, sessionid, ismasked, frontendsocketid, leftsession, userrole, secret
    ) 
    VALUES (
        param_nickname, device_id, found_session_id, FALSE, socket_id, NULL, user_role, 'secret'
    ) RETURNING userid INTO user_id;

    -- Update device availability
    IF user_id IS NOT NULL THEN
        PERFORM Update_Device_Availability(device_id, FALSE);
    END IF; 

    -- Return user data
    RETURN QUERY 
    SELECT "User".userid, "User".nickname, "User".sessionid, "User".ismasked, 
           "User".frontendsocketid, "User".leftsession, "User".userrole
    FROM "User" WHERE "User".userid = user_id;
END;
$$ LANGUAGE plpgsql;


-- Join_Session_Without_EmotiBit
CREATE OR REPLACE FUNCTION Join_Session_Without_EmotiBit(
    param_nickname VARCHAR(100), 
    socket_id VARCHAR(100), 
    room_code TEXT, 
    user_role VARCHAR(100)
)
RETURNS TABLE (
    joiner_userid INT,
    joiner_nickname VARCHAR(100),
    joiner_sessionid INT,
    joiner_ismasked BOOL,
    joiner_frontendsocketid VARCHAR(100),
    joiner_leftsession TIMESTAMP,
    joiner_userrole VARCHAR(100),
    joiner_deviceid INT
) AS $$
DECLARE 
    found_session_id INT;
    user_id INT;
BEGIN
    -- Get session ID
    SELECT sessionid INTO found_session_id 
    FROM session WHERE roomcode = room_code 
    AND endtimestamp IS NULL LIMIT 1;

    IF found_session_id IS NULL THEN
        RAISE EXCEPTION 'No session found for RoomCode: %', room_code;
    END IF;

    -- Create a User without an associated device
    INSERT INTO "User" (
        nickname, device, sessionid, ismasked, frontendsocketid, leftsession, userrole
    ) 
    VALUES (
        param_nickname, NULL, found_session_id, FALSE, socket_id, NULL, user_role
    ) RETURNING userid INTO user_id;

    -- Return user data
    RETURN QUERY 
    SELECT "User".userid, "User".nickname, "User".sessionid, "User".ismasked, 
           "User".frontendsocketid, "User".leftsession, "User".userrole, 
        "User".device
    FROM "User" WHERE "User".userid = user_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION Remove_Session(sessionid INT) RETURNS BOOLEAN AS 
$$ 
DECLARE 
	
	BEGIN
        -- If the session doesn't exist, return false
        IF NOT EXISTS (SELECT 1 FROM session WHERE session.sessionid = Remove_Session.sessionid) THEN
            RETURN FALSE; 
        END IF;

		-- Step 1: Set devices used by session users to available
	    UPDATE Device
		    SET IsAvailable = TRUE
		    WHERE DeviceID IN (
		        SELECT Device FROM "User"
		        WHERE "User".sessionid = Remove_Session.sessionid
		    );

		-- Step 2: Delete the users in the session
		delete from "User" where "User".sessionid = Remove_Session.sessionid;

		-- Step 3: Delete the session 
		delete from session where session.sessionid = Remove_Session.sessionid;
	
		return true;
	END; 
	
$$ LANGUAGE plpgsql;
