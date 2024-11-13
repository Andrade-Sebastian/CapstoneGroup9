#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
    emotiBitWiFi.begin();
}

//--------------------------------------------------------------
void ofApp::update(){
    discoverEmotiBits();
}

//--------------------------------------------------------------
void ofApp::draw(){

}

//--------------------------------------------------------------
void ofApp::exit(){

}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){

}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){

}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseScrolled(int x, int y, float scrollX, float scrollY){

}

//--------------------------------------------------------------
void ofApp::mouseEntered(int x, int y){

}

//--------------------------------------------------------------
void ofApp::mouseExited(int x, int y){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}

void ofApp::discoverEmotiBits(){
    auto discoveredEmotibits = emotiBitWiFi.getdiscoveredEmotibits();
        for (auto it = discoveredEmotibits.begin(); it != discoveredEmotibits.end(); it++)
        {
            string deviceId = it->first;
            bool available = it->second.isAvailable;
            bool found = false;
            
        for (auto device = deviceList.begin(); device != deviceList.end(); device++)
            {
                if (*device == deviceId)
                {
                    cout << "device already found" << endl;
                    cout << "device found: " << *device << endl;
                    found = true;
                    break;
                }
            }
            
            if(!found){
                deviceList.push_back(deviceId);
                found = true;
                cout << "new device added" << endl;
                cout << "device added: " << deviceId << endl;
            }
        }
}
