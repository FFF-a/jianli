@echo off
chcp 936 >nul
cd /d %~dp0

echo ========================================
echo  猎职 LieZhi - 一键构建部署
echo ========================================
echo.

REM --- Auto-detect Java ---
if not defined JAVA_HOME (
    for /d %%i in ("C:\Program Files\Microsoft\jdk*") do set JAVA_HOME=%%i
)
if not defined JAVA_HOME (
    for /d %%i in ("C:\Program Files\Java\jdk*") do set JAVA_HOME=%%i
)
if not defined JAVA_HOME (
    for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk*") do set JAVA_HOME=%%i
)
if defined JAVA_HOME (
    set JAVA_EXE=%JAVA_HOME%\bin\java.exe
    set PATH=%JAVA_HOME%\bin;%PATH%
    echo [OK] Java: %JAVA_HOME%
) else (
    echo [ERROR] 未找到 Java，请安装 JDK 17 或设置 JAVA_HOME 环境变量
    pause
    exit /b 1
)
echo.

echo [1/3] 构建前端...
call pnpm vite build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 前端构建失败！
    pause
    exit /b 1
)
echo 前端构建完成
echo.

echo [2/3] 打包后端...
cd backend
call mvnw.cmd package -DskipTests -q
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 后端打包失败！
    pause
    exit /b 1
)
echo 后端打包完成
cd ..
echo.

echo [3/3] 启动服务...
echo 访问 http://localhost:8080
echo 按 Ctrl+C 停止
echo.
"%JAVA_EXE%" -jar backend\target\liezhi-backend-1.0.0.jar

pause
