# Minimum CMake version required
cmake_minimum_required(VERSION 3.15)

# Project name
project(emotiBits)

# Protobuf
set(Protobuf_DIR "/opt/homebrew/bin/protoc")
#set(CMAKE_PREFIX_PATH "/Users/haley/grpc/cmake" CACHE STRING "Path to gRPC CMake files")
set(GRPC_DIR "/Users/haley/grpc/cmake/build")
find_package(gRPC REQUIRED)
find_package(Protobuf REQUIRED)
# gRPC
#option(USE_SYSTEM_GRPC "Use system installed gRPC" OFF)
#if(USE_SYSTEM_GRPC)
  # Find system-installed gRPC
 # find_package(gRPC CONFIG REQUIRED)
#else()
  # Build gRPC using FetchContent or add_subdirectory
#find_package(gRPC REQUIRED)
message(STATUS "Found Protobuf version: ${Protobuf_VERSION}")
message(STATUS "Found gRPC version: ${gRPC_VERSION}")

#endif()


# Include the generated .pb.h and .grpc.pb.h files
include_directories("${CMAKE_CURRENT_SOURCE_DIR}")

# Source files (add your .cc files here)
set(SOURCES
    emotiBits_client.cc
  "${CMAKE_CURRENT_SOURCE_DIR}/emotiBits.pb.cc"
  "${CMAKE_CURRENT_SOURCE_DIR}/emotiBits.grpc.pb.cc"
)

# Create the executable
add_executable(emotiBits_client ${SOURCES})

# Link against protobuf and gRPC
target_link_libraries(emotiBits_client
  ${Protobuf_LIBRARIES}
  gRPC::grpc++
)
