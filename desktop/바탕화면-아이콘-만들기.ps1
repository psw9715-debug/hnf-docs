# 이 스크립트를 한 번만 실행하면 바탕화면에 "혀니네 납품확인서" 아이콘이 생깁니다.
# 실행 방법: 이 파일을 우클릭 -> "PowerShell로 실행"
#   (막혀있다면 PowerShell을 열고: powershell -ExecutionPolicy Bypass -File "D:\hnf-docs\desktop\바탕화면-아이콘-만들기.ps1")

$AppDir = "D:\hnf-docs\desktop"
$Target = Join-Path $AppDir "launch-silent.vbs"
$IconPath = Join-Path $AppDir "icon.ico"
$Desktop = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $Desktop "혀니네 납품확인서.lnk"

if (-not (Test-Path $Target)) {
    Write-Host "launch-silent.vbs를 찾을 수 없어요. 먼저 'git pull'로 최신 코드를 받아주세요." -ForegroundColor Red
    exit 1
}

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $Target
$Shortcut.WorkingDirectory = $AppDir
$Shortcut.IconLocation = $IconPath
$Shortcut.Description = "혀니네홈패션 거래문서"
$Shortcut.Save()

Write-Host "바탕화면에 '혀니네 납품확인서' 아이콘을 만들었어요! 이제 더블클릭으로 실행하세요." -ForegroundColor Green
