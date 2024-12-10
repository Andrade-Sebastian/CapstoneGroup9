const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "./protos/emotiBits.proto";
var protoLoader = require("@grpc/proto-loader");

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  };
  
  var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
  
  const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
  const emotiBits = protoDescriptor.emotiBits.findDevices;

  const client = new emotiBits("localhost:50051", grpc.credentials.createInsecure());
  
  // const client = new findDevices(
  //   "localhost:50051",
  //   grpc.credentials.createInsecure()
  // );

  console.log("Starting client");


  function requestDevices(sessionId){
    const message = {sessionId: sessionId};
    client.foundDevices({sessionId: sessionId}, (error, devices) => {
    if(error){
      console.error("Error", error);
    }
    if (devices && devices.allDevices) {
      for (const device of devices.allDevices) {
    console.log(`Device Serial: ${device.serial}, Device IP: ${device.ip}`);
  }
    } else {
      console.log("No devices found or response format is incorrect.");
    }
  });
  }

  requestDevices("MikeTyson");