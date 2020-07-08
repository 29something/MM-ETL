#!/bin/bash

timestamp=$(date +"%m%d%Y%I%M%S")
echo "fetching nav file for $timestamp..."
curl "https://www.amfiindia.com/spages/NAVAll.txt?t=$timestamp" -o ../../data/csv/nav.txt
echo "nav file downloaded."

node main.js