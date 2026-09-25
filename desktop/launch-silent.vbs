' cmd 창 없이 조용히 실행 (npm을 거치지 않고 electron.exe를 바로 호출해서 더 빠름)
' 문제가 생기면 desktop\launch-log.txt 에 에러가 남음
Set WshShell = CreateObject("WScript.Shell")
appDir = "D:\hnf-docs\desktop"
cmdLine = "cmd /c cd /d """ & appDir & """ && node_modules\electron\dist\electron.exe . > launch-log.txt 2>&1"
WshShell.Run cmdLine, 0, False
