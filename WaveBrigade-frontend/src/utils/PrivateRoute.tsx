import React, { ReactElement } from 'react';
import { Outlet, Navigate } from "react-router-dom";
import { useJoinerStore } from '../hooks/stores/useJoinerStore.ts';

const PrivateRoute = (props: {children: ReactElement}) =>{
    const {secret} = useJoinerStore();
    console.log( "This is my secret", secret)
    if(secret !== undefined){
        return props.children
    }
    else{
        console.error("Error, secret is null")
        return <Navigate to='/'/>;
    }
};

export default PrivateRoute