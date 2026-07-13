import { execSync, spawnSync } from 'child_process';

const envVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyAWOUNQ3xMxzYWC1bhpV0Olndc1rjjt0xk",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "hrgacivil-project.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "hrgacivil-project",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "hrgacivil-project.firebasestorage.app",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "730607112425",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:730607112425:web:b4dd806e8488bcc7be6078",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-X9ZWVRHGSH"
};

for (const [key, val] of Object.entries(envVars)) {
    console.log(`Removing ${key}...`);
    try {
        execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' });
    } catch(e) {}
    
    console.log(`Setting ${key}...`);
    spawnSync('npx.cmd', ['vercel', 'env', 'add', key, 'production'], {
        input: val,
        stdio: ['pipe', 'inherit', 'inherit']
    });
}
console.log('Done!');
