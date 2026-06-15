@echo off
echo Removing variables...
call npx vercel env rm NEXT_PUBLIC_FIREBASE_API_KEY production -y >nul 2>&1
call npx vercel env rm NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production -y >nul 2>&1
call npx vercel env rm NEXT_PUBLIC_FIREBASE_PROJECT_ID production -y >nul 2>&1
call npx vercel env rm NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production -y >nul 2>&1
call npx vercel env rm NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production -y >nul 2>&1
call npx vercel env rm NEXT_PUBLIC_FIREBASE_APP_ID production -y >nul 2>&1
call npx vercel env rm NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID production -y >nul 2>&1

echo Adding variables...
<nul set /p="AIzaSyAWOUNQ3xMxzYWC1bhpV0Olndc1rjjt0xk" | call npx vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
<nul set /p="hrgacivil-project.firebaseapp.com" | call npx vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
<nul set /p="hrgacivil-project" | call npx vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
<nul set /p="hrgacivil-project.firebasestorage.app" | call npx vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
<nul set /p="730607112425" | call npx vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
<nul set /p="1:730607112425:web:b4dd806e8488bcc7be6078" | call npx vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
<nul set /p="G-X9ZWVRHGSH" | call npx vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID production

echo Done!
