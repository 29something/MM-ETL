#!/bin/bash

BASEDIR=$(dirname "$0")
echo $BASEDIR
cd $BASEDIR

node main.js "ORDER_STATUS" "INVALID"