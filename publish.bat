@echo off
:PROMPT
SET /P AREYOUSURE=Dont forget to check if you updated version in package.json (Y/[N])?
IF /I "%AREYOUSURE%" NEQ "Y" exit
@echo on
npm run package
npm publish

