import { HiUserAdd } from "react-icons/hi";
import { HiAcademicCap } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import CardComponent from "../Components/CardComponent.tsx";


import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');


export default function Home() {
  const navigateTo = useNavigate();
  

    // // Listen for updates from the server
    // socket.on('update', (data) => {
    //   console.log('Received data:', data);

    // });


  function handleJoinButtonClick() {
    navigateTo("join");
  }

  function handleHostButtonClick() {
    navigateTo("host/create");
  }

  function handleLabButtonClick() {
    navigateTo("create-lab");
  }

  return (
    <div className="flex flex-col">
      <div className="justify-center text-white py-10">
        <h1 className="text-center text-2xl">Welcome to Wavebrigade!</h1>
      </div>
      {/* body */}
      <div className="flex flex-col">
        <div className="flex justify-center items-center gap-28">
          {/* HOST */}
          <button onClick={handleHostButtonClick}>
            {/* <Card className="max-w-[500px]">
          <CardHeader className="">
          
          <HiAcademicCap style={{fontSize: "60px" }}/>
          
          <div className="flex flex-col">
          <p className="justify-center text-4xl"> Host</p>
            </div>
            </CardHeader>
            <Divider />
            <CardBody>
            <p className="text-2xl">Click to host and create an experiment</p>
            </CardBody>
            </Card> */}
            <CardComponent
              icon={<HiAcademicCap style={{ fontSize: "40px" }} />}
              headingTitle="Host"
              description="Click to host and create an experiment"
            />
          </button>
          <button onClick={handleJoinButtonClick}>
            <CardComponent
              icon={<HiUserAdd style={{ fontSize: "40px" }} />}
              headingTitle="Join"
              description="Click to join a created lobby as a student or a spectator"
            />
          </button>
          {/* replace google.com with the link to the next page on Figma */}
          {/* <p>Educator: <a href="create-lab">Create New Experiment</a></p> */}

        </div>
        <div className="flex justify-center items-center text-white py-10">
          <button className="px-20" onClick={handleLabButtonClick}>
            Create New Experiment
          </button>
        </div>
      </div>
    </div>
  );
}
