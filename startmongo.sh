#!/bin/bash

#mongod --version
#db version v2.6.12
#2018-09-18T16:31:32.007+0000 git version: d73c92b1c85703828b55c2916a5dd4ad46535f6a

screen -dmS MONGO mongod --dbpath /home/explorer/db --port 27010 --bind_ip 127.0.1.1 --auth
