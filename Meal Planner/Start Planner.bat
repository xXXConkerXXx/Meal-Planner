@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

> "scripts\plugins\manifest.js" echo window.INSTALLED_PLUGINS = Array.of(
set "first=1"
for /d %%D in ("scripts\plugins\*") do (
    if exist "%%D\plugin.js" (
        if "!first!"=="1" (
            >> "scripts\plugins\manifest.js" echo     "%%~nxD"
            set "first=0"
        ) else (
            >> "scripts\plugins\manifest.js" echo     ,"%%~nxD"
        )
    )
)
>> "scripts\plugins\manifest.js" echo );

start "" "index.html"
