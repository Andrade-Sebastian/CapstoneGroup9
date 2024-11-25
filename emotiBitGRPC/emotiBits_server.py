from concurrent import futures
import grpc
import emotiBits_pb2_grpc
import emotiBits_pb2

class FindDevices(emotiBits_pb2_grpc.findDevices):
    def getDevices(self, request, context):
        print("GetDevices Request Made:")
        print(request)
        for device in request.allDevices:
            device_list = emotiBits_pb2.DeviceResponse()
            device_list.status = f"{device.serial} {device.ip} processed"
            yield device_list
    
    def foundDevices(self, request, context):
        return super().foundDevices(request, context)
    
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    emotiBits_pb2_grpc.add_findDevicesServicer_to_server(FindDevices(), server)
    server.add_insecure_port("localhost:50051")
    print("Starting Server")
    server.start()
    server.wait_for_termination()

if __name__ == "__main__":
    serve();