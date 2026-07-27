# 500 Internal Server Error Diagnosis
The 500 error from Nginx indicates that the Node.js backend (managed by PM2) has likely crashed on startup and is in a restart loop.

This almost certainly happened because when you ran `git pull`, the `backend/database.sqlite` file from GitHub overwrote your live database, AND because Git often corrupts binary SQLite files by converting line endings (`CRLF`). 

To fix this, you need to restore your live database from the `git stash` you created earlier, and check the PM2 logs to confirm the error.
