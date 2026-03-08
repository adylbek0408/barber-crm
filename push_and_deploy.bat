@echo off
cd /d C:\Users\User\Desktop\barbercrm
echo === Коммитим изменения ===
git add -A
git commit -m "fix: baseURL localhost -> /api"
git push
echo === Готово! Теперь иди на сервер и выполни deploy ===
pause


