$envFile = "d:\Civil project\.env.vercel.tmp"
foreach ($line in Get-Content $envFile) {
    if ($line -match "^(.*?)=""(.*?)""$") {
        $key = $matches[1]
        $val = $matches[2]
        Write-Host "Removing $key..."
        npx vercel env rm $key production -y
        Write-Host "Setting $key to $val"
        $val | npx vercel env add $key production
    }
}
