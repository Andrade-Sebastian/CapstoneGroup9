#!/bin/bash

# Generate the JavaScript and TypeScript files from the proto file
npm run grpc_tools_node_protoc \
  --js_out=import_style=commonjs,binary:./protos \
  --grpc_out=. \
  --plugin=protoc-gen-grpc=/Users/haley/node_modules/ts-protoc-gen \
  --ts_out=. \
  ./protos/emotiBits.proto

