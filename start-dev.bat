@echo off
color 0A
title Portfolio - Démarrage Automatique

echo.
echo  ========================================
echo          🚀 PORTFOLIO FULL STACK 🚀
echo  ========================================
echo.
echo  📡 Démarrage du backend (Port 5000)...
echo  🎨 Démarrage du frontend (Port 3000)...
echo.

REM Vérifier que les dossiers existent
if not exist "backend" (
    echo ❌ Erreur: Le dossier 'backend' n'existe pas
    echo 💡 Assurez-vous d'être dans le dossier racine du projet
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Erreur: Le dossier 'frontend' n'existe pas
    echo 💡 Assurez-vous d'être dans le dossier racine du projet
    pause
    exit /b 1
)

REM Démarrer le backend dans une nouvelle fenêtre
echo 📡 Lancement du backend...
start "Portfolio Backend - Port 5000" cmd /k "cd /d "%~dp0backend" && echo 🚀 Démarrage du serveur backend... && npm run dev"

REM Attendre 3 secondes pour que le backend démarre
echo ⏳ Attente du démarrage du backend (3 secondes)...
timeout /t 3 /nobreak > nul

REM Démarrer le frontend dans une nouvelle fenêtre
echo 🎨 Lancement du frontend...
start "Portfolio Frontend - Port 3000" cmd /k "cd /d "%~dp0frontend" && echo 🎨 Démarrage de React... && npm start"

REM Attendre que les serveurs démarrent
echo ⏳ Initialisation des serveurs...
timeout /t 5 /nobreak > nul

echo.
echo  ✅ Les serveurs sont en cours de démarrage !
echo  📱 Frontend: http://localhost:3000
echo  📡 Backend:  http://localhost:5000
echo.
echo  💡 Fermez cette fenêtre pour arrêter les serveurs
echo  💡 Ou appuyez sur Ctrl+C dans chaque fenêtre
echo.

REM Ouvrir automatiquement le navigateur
echo 🌐 Ouverture du navigateur...
start http://localhost:3000

echo  🎉 Portfolio démarré avec succès !
echo.
pause