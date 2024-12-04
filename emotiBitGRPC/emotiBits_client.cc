#include <iostream>
#include <string.h>
#include <thread>
#include "emotiBits.grpc.pb.h"
#include <grpc/grpc.h>
#include <grpcpp/channel.h>
#include <grpcpp/client_context.h>
#include <grpcpp/create_channel.h>
#include <grpcpp/security/credentials.h>

using grpc::Channel;
using grpc::ClientContext;
using grpc::ClientReader;
using grpc::ClientReaderWriter;
using grpc::ClientWriter;
using grpc::Status;
using emotiBits::Device;
using emotiBits::findDevices;
using emotiBits::DeviceList;
using emotiBits::DeviceResponse;


Device MakeDevice(std::string serial, std::string ip){
    Device d;
    d.set_serial(serial);
    d.set_ip(ip);
    return d;
}

class EmotiBitsClient{
    public:
        EmotiBitsClient(std::shared_ptr<Channel> channel)
            : stub_(findDevices::NewStub(channel)){}
        
        void getDevices(){
            DeviceList list;
            DeviceResponse response;
            ClientContext context;

            *list.add_alldevices() = MakeDevice("47WX", "192.168.1.1");
            *list.add_alldevices() = MakeDevice("69T3", "192.168.1.2");

            std::cout << "GetDevices Response Received: " << std::endl;
            std::cout << "Sending device list with " << list.alldevices_size() << " devices" << std::endl;
            std::unique_ptr<ClientReader<DeviceResponse>> reader(
                stub_->getDevices(&context, list));
                while(reader->Read(&response)){
                    std::cout << "Status: " << response.status() << std::endl;
                }
                Status status = reader->Finish();
                if(status.ok()){
                    std::cout << "getDevices succeeded." << std::endl;
                }
                else{
                    std::cout << "getDevices failed" << std::endl;
                }
            
        }

    private:
    std::unique_ptr<findDevices::Stub> stub_;
        
};

int main(int argc, char** argv) {
    std::cout << "Starting client" << std::endl;
    EmotiBitsClient emotibit(
        grpc::CreateChannel("localhost:50051", grpc::InsecureChannelCredentials()));
        std::cout << "----------GetDevices-------------" << std::endl;
        emotibit.getDevices();
        return 0;
}



