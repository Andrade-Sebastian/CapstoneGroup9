--Author: Emanuelle Pelayo
--Procedures & Functions for the following database functions:
	-- 1. Checking if a session is available
	-- 2. Getting a Session with its users
	-- 3. Updating the availability status of a device
	-- 4. Getting all users in a session
	-- 5. Getting the state of a session

drop function if exists Check_Session_Availability(VARCHAR(100));
drop function if exists Get_Session_Mappings(INT);
drop function if exists Update_Device_Availability (INT, BOOL);
drop function if exists Get_Session_Users(INT);
drop function if exists Create_Session(VARCHAR(100), VARCHAR(100), BOOLEAN, VARCHAR(100), BOOLEAN);
drop function if exists Join_Session(VARCHAR(100), VARCHAR(100), TEXT, VARCHAR(100), TEXT);
drop function if exists Join_Session_Without_EmotiBit(VARCHAR(100), VARCHAR(100), TEXT, VARCHAR(100));




CREATE OR REPLACE FUNCTION Create_Session(room_code VARCHAR(100), host_socket_id VARCHAR(100), is_password_protected BOOLEAN, "password" VARCHAR(100), is_spectators_allowed BOOLEAN)
RETURNS TABLE (-- SESSION MINUS PASSWORD
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
	--insert the new session 
	INSERT INTO session(roomcode, hostsocketid, starttimestamp, ispasswordprotected, password, isspectatorsallowed, endtimestamp) 
	VALUES (
		room_code, 
		host_socket_id,
		null, -- starttimestamp
		is_password_protected, 
		password, 
		is_spectators_allowed, 
		null -- endtimestamp
	);
    RETURN QUERY
		SELECT session.sessionid, session.experimentid, session.roomcode, session.hostsocketid, session.starttimestamp, session.ispasswordprotected, session.isspectatorsallowed, session.endtimestamp from session
			WHERE session.roomcode = room_code;	
END;
$$ LANGUAGE plpgsql;

-- select * from Create_Session(2, '1234567', 'host-socket-id', FALSE, null, FALSE);

--DONE
--Check_Session_Availability (room_code): 
--  Used to verify given session exists and on-going (i.e., no end timestamp)
-- 	in the database using the given room_code. => Return Entire Session.
drop function if exists Check_Session_Availability(VARCHAR(100));
CREATE FUNCTION Check_Session_Availability(room_code VARCHAR(100)) --Done
RETURNS TABLE (
    session__id INT,
    experiment__id INT,
    roomcode__ VARCHAR(100),
    hostsocketid__ VARCHAR(100),
    starttimestamp__ TIMESTAMP,
    ispasswordprotected__ BOOLEAN,
    isspectatorsallowed__ BOOLEAN,
    endtimestamp__ TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
        -- If there is no end timestamp in the below query, return the session table 					containing the room code
        SELECT session.sessionid, 
               session.experimentid, 
               session.roomcode, 
               session.hostsocketid,
               session.starttimestamp, 
               session.ispasswordprotected, 
               session.isspectatorsallowed, 
               session.endtimestamp
        FROM session
        WHERE session.roomcode = room_code
          AND session.endtimestamp IS NULL;

    -- Else return an empty table
    IF NOT FOUND THEN
        RETURN QUERY 
			SELECT NULL::INT, NULL::INT, NULL::VARCHAR, NULL::VARCHAR, 
                   NULL::TIMESTAMP, NULL::BOOLEAN, NULL::BOOLEAN, NULL::TIMESTAMP;
    END IF;
END;
$$ LANGUAGE plpgsql;


--To call this, run: 
-- SELECT * FROM Check_Session_Availability('12345');

--Get_Session_State: (Return Session)
CREATE FUNCTION Get_Session_State(room_code VARCHAR(100))
RETURNS TABLE ( --returns the session table minus the password
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
        -- If there is no end timestamp in the below query, return the session table 					containing the room code
        SELECT session.sessionid, 
               session.experimentid, 
               session.roomcode, 
               session.hostsocketid,
               session.starttimestamp, 
               session.ispasswordprotected, 
               session.isspectatorsallowed, 
               session.endtimestamp
        FROM session
        WHERE session.roomcode = room_code;

    -- Else return an empty table
    IF NOT FOUND THEN
        RETURN QUERY 
			SELECT NULL::INT, NULL::INT, NULL::VARCHAR, NULL::VARCHAR, 
                   NULL::TIMESTAMP, NULL::BOOLEAN, NULL::BOOLEAN, NULL::TIMESTAMP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- SELECT * FROM Get_Session_State('12345');



-- Create_Device (ip_address, serial_number, device_socket_id, sampling_frequency): 
-- Used when Host adds a new device to a session. Returns Device Table
drop function if exists Create_Device(VARCHAR(100), VARCHAR(100), VARCHAR(100), INT);

CREATE FUNCTION Create_Device(
    ip_address VARCHAR(100), 
    serial_number VARCHAR(100), 
    device_socket_id VARCHAR(100), 
    sampling_frequency INT DEFAULT 50 -- Default value based on schema
) 
RETURNS TABLE (
    deviceid INT,
    ipaddress VARCHAR(100),
    serialnumber VARCHAR(100),
    devicesocketid VARCHAR(100),
    samplingfrequency INT,
    isavailable BOOLEAN,
    isconnected BOOLEAN
) AS $$
DECLARE 
    new_device_id INT;
BEGIN
    -- Insert into Device table and return the new DeviceID
    INSERT INTO Device (ipaddress, serialnumber, devicesocketid, samplingfrequency, isavailable, isconnected)
	    VALUES (ip_address, serial_number, device_socket_id, sampling_frequency, TRUE, FALSE)
	    RETURNING DEVICE.DeviceID INTO new_device_id;

    -- Return all fields from Device and User tables
    RETURN QUERY 
		-- SELECT * FROM Device WHERE Device.deviceid = new_device_id;
	    SELECT dev.deviceid, dev.ipaddress, dev.serialnumber, dev.devicesocketid, dev.samplingfrequency, 
	           dev.isavailable, dev.isconnected, 
	           usr.userid, usr.nickname, usr.sessionid, usr.ismasked, 
	           usr.frontendsocketid, usr.leftsesssrion, usr.userrole, usr.secret
	    FROM Device dev
	    LEFT JOIN "User" usr ON usr.device = dev.deviceid
	    WHERE dev.deviceid = new_device_id;

END;
$$ LANGUAGE plpgsql;

--Call it like so: 
-- SELECT * FROM Create_Device(
--     '192.168.1.100', 
--     'SN-12345', 
--     'socket-xyz', 
--     100
-- );

---------------------------------------------------------------------------
---------------------------------------------------------------------------
---------------------------------------------------------------------------
--Update_Device_Availability (session_id, device_id, update_is_available: Bool): 
--Update device’s availability status by updating Associated Device IsAvailable key 
--to the given is_available value. Returns all fields in the Device Table @device_id

drop function if exists Update_Device_Availability (INT, BOOL);

CREATE FUNCTION Update_Device_Availability(device_id INT, is_available BOOL) --DONE
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
	--update device availability
	UPDATE device SET isavailable = is_available WHERE device.deviceid = device_id;

	RETURN QUERY --return the device's table
		SELECT device.deviceid, device.ipaddress, device.serialnumber, device.devicesocketid, device.samplingfrequency, device.isavailable, device.isconnected from device WHERE device.deviceid = device_id;

END;
$$ LANGUAGE plpgsql;
-- select * from Update_Device_Availability(1, TRUE);




--Get_Session_Users (Return Users in a Session)
CREATE FUNCTION Get_Session_Users(session_id INT) --Done
RETURNS TABLE ( --user table
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
-- SELECT * from Get_Session_Users(0); 


-- Used for getting the Device Table and User Table together. 
-- Return Table with the following Headers: 
-- User ID, Frontend Socket ID, Backend Socket ID)
drop function if exists Get_Session_Mappings(INT);

CREATE FUNCTION Get_Session_Mappings(session_id INT) --DONE
RETURNS TABLE(
	user_id INT, 
	frontend_socketid VARCHAR(100),
	deviceid INT,
	devicesocketid VARCHAR(100)
	--backend_socketid VARCHAR(100) -- assuming this is for the session, omitting for now, maybe this needs to be sessionid? 
) AS $$
DECLARE
	device_id INT;
BEGIN
	RETURN QUERY
		--join user and device tables on device id or user id 
		SELECT userid, frontendsocketid, device.deviceid, device.devicesocketid
			FROM "User"
			JOIN device ON "User".device = device.deviceid
			WHERE "User".sessionid = session_id 
			AND device.isavailable = TRUE;

		
		--exclude devices with isavailable=true
		--return result

END;
$$ LANGUAGE plpgsql;

-- SELECT * FROM Get_Session_Mappings(4);

-- Join_Session (nickname, room_code, user_role, sn_four_digits): 
-- Used for joining a session (by creating a new user and associated device entry with relationship). 

-- 0.find a session at sessionid 
--		if it is found, continue
-- 1. Create User, *Done*
-- 2. Relate Device to User via sn_four_digits *done*
-- 3. return device-user table *done*



CREATE FUNCTION Join_Session(param_nickname VARCHAR(100), socket_id VARCHAR(100), room_code TEXT, user_role VARCHAR(100), sn_four_digits TEXT, device_id INT)
RETURNS TABLE(
	joiner_deviceid INT, 
	joiner_ipaddress VARCHAR(100),
	joiner_serialnumber VARCHAR(100), 
	joiner_devicesocketid VARCHAR(100), 
	joiner_samplingfrequency INT,            
	joiner_isavailable BOOL, 
	joiner_isconnected BOOL,
	joiner_userid INT, 
	joiner_nickname VARCHAR(100), 
	joiner_sessionid INT, 
	joiner_ismasked BOOL, 
	joiner_frontendsocketid VARCHAR(100), 
	joiner_leftsession TIMESTAMP, 
	joiner_userrole VARCHAR(100),
	joiner_secret VARCHAR(100)
	)AS $$
DECLARE 
    found_session_id INT;
	device_id INT;
	user_id INT;
BEGIN

    -- Get session ID by checking session availability
    SELECT session__id INTO found_session_id FROM Check_Session_Availability(room_code) LIMIT 1;

	IF found_session_id IS NULL THEN
		RAISE EXCEPTION 'No session found for RoomCode: %', room_code;
	END IF;
	
    IF found_session_id IS NOT NULL THEN
		RAISE NOTICE 'Session found with ID: %', found_session_id;

		-- Create a User
        INSERT INTO "User" (
            nickname, 
            device, 
            sessionid, 
            ismasked, 
            frontendsocketid, 
            leftsession, 
            userrole, 
            secret
        ) 
        VALUES (
            param_nickname, 
            device_id, -- device
            found_session_id, 
            FALSE, 
            socket_id, -- frontendsocketid
            NULL, -- leftsession
            user_role, 
            'secret' -- secret -- FUTURE
        ) RETURNING userid INTO user_id;	
		
		RAISE NOTICE 'updating device availability';
		--Make the device unavailable for other users
		IF user_id IS NOT NULL THEN
			PERFORM Update_Device_Availability(device_id, FALSE);
		END IF;	

		--get device id at serial number (trim to last 4)
		select deviceid into device_id from device where RIGHT(device.serialnumber, 4) = sn_four_digits LIMIT 1;
		
		-- Ensure a device was found before updating the user
		IF device_id IS NOT NULL THEN
			UPDATE "User" SET device = device_id 
				--get device at the session 
				WHERE "User".sessionid IN (
					SELECT sessionid FROM session WHERE roomcode = room_code
				) 
					AND (device IS NULL OR device IN (
						SELECT deviceid 
						FROM device 
						WHERE RIGHT(serialnumber, 4) = sn_four_digits
		)); --- add "else, and exceptions"
		END IF;
		END IF;
	
	   -- Return all fields from Device and User tables
	     RETURN QUERY 
		    SELECT dev.deviceid, dev.ipaddress, dev.serialnumber, dev.devicesocketid, dev.samplingfrequency, 
		           dev.isavailable, dev.isconnected, 
		           usr.userid, usr.nickname, usr.sessionid, usr.ismasked, 
		           usr.frontendsocketid, usr.leftsession, usr.userrole, usr.secret
		    FROM Device dev
		    LEFT JOIN "User" usr ON usr.device = dev.deviceid
		    	WHERE dev.deviceid = device_id;
END
$$ LANGUAGE plpgsql;

-- SELECT * FROM Join_Session('JohnDoe', '12345', 'Joiner', '3456');

CREATE OR REPLACE FUNCTION Join_Session_Without_EmotiBit(param_nickname VARCHAR(100), socket_id VARCHAR(100), room_code TEXT, user_role VARCHAR(100))
RETURNS TABLE(
	joiner_userid INT,
	joiner_nickname VARCHAR(100),
	joiner_sessionid INT,
	joiner_ismasked BOOL,
	joiner_frontendsocketid VARCHAR(100),
	joiner_leftsession TIMESTAMP,
	joiner_userrole VARCHAR(100)
	)AS $$

	
DECLARE 
    found_session_id INT;
	device_id INT;
	user_id INT;
BEGIN

    -- Get session ID by checking session availability
    SELECT session__id INTO found_session_id FROM Check_Session_Availability(room_code) LIMIT 1;

	IF found_session_id IS NULL THEN
		RAISE EXCEPTION 'No session found for RoomCode: %', room_code;
	END IF;
	
    IF found_session_id IS NOT NULL THEN
		RAISE NOTICE 'Session found with ID: %', found_session_id;

		-- Create a User
        INSERT INTO "User" (
            nickname, 
            device, 
            sessionid, 
            ismasked, 
            frontendsocketid, 
            leftsession, 
            userrole, 
            secret
        ) 
        VALUES (
            param_nickname, 
            null, -- device
            found_session_id, 
            FALSE, 
            socket_id, -- frontendsocketid
            NULL, -- leftsession
            user_role, 
            'secret' -- secret -- FUTURE
        ) RETURNING userid INTO user_id;	
	END IF;
	
	-- Return all fields from Device and User tables
	RETURN QUERY 
	SELECT 
			"User".userid, "User".nickname, "User".sessionid, "User".ismasked, 
			"User".frontendsocketid, "User".leftsession, "User".userrole
	FROM "User" where "User".userid = user_id;
END
$$ LANGUAGE plpgsql;