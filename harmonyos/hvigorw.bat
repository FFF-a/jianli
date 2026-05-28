@echo off
set "SCRIPT_DIR=%~dp0"
set "HVIGOR_DIR=%SCRIPT_DIR%hvigor"
set "WRAPPER_PATH=%HVIGOR_DIR%\hvigor-wrapper.js"

if not exist "%SCRIPT_DIR%node_modules\@ohos\hvigor" (
    echo [hvigorw] Installing build dependencies...
    cd /d "%SCRIPT_DIR%"
    call npm install --save-dev @ohos/hvigor @ohos/hvigor-ohos-plugin
)

node "%WRAPPER_PATH%" %*
