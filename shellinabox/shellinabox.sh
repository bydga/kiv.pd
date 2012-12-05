#!/bin/bash

killall screen
killall shellinaboxd

screen -dmS session_dev_tty_usb0 
screen -S session_dev_tty_usb0 -X stuff "minicom -o\\n"
shellinaboxd -p 4200 -s '/:root:root:/:screen -x session_dev_tty_usb0' &

screen -dmS session_dev_tty_usb1 
screen -S session_dev_tty_usb1 -X stuff "minicom -o\\n"
shellinaboxd -p 4300 -s '/:root:root:/:screen -x session_dev_tty_usb1' &
