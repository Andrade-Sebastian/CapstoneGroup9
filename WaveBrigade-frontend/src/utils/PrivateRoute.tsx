import React, { ReactElement } from 'react';
import { Outlet, Navigate } from "react-router-dom";
import { useJoinerStore } from '../hooks/stores/useJoinerStore.ts';

const PrivateRoute = (props: {children: ReactElement}) =>{
    const {sessionId} = useJoinerStore();
    console.log( "This is the sessionId", sessionId)
    if(sessionId){
        console.log("There exists a sessionId")
        return props.children
    }
    else{
        console.error("Error, sessionId is null")
        return <Navigate to='/'/>;
    }
};

export default PrivateRoute