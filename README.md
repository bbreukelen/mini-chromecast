# mini-chromecast
Command line tool to get chromecast receiver status and do pause/play  

This tools connects to a chromecast device, pulls the running session and joins it to control it.  

### Installation
git clone https://github.com/bbreukelen/mini-chromecast.git  
cd mini-chromecast  
npm install  

### Usage
To get the playing status:  
./chromecast ip_address status  

To start playing:  
./chromecast ip_address play  

To pause:
./chromecast ip_address pause  

### Info
Uncommenting some code in chromecast allows you to keep it running and listening for status changes.
 