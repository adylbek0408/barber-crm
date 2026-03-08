@echo off
cd /d C:\Users\User\Desktop\barbercrm
echo === Коммитим изменения ===
git add -A
git commit -m "fix: service barber readonly, ServiceForm no keyboard close"
git push --force
echo === Готово! Теперь иди на сервер и выполни deploy ===
pause
