$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

$content = $content.Replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';`nimport * as ImagePicker from 'expo-image-picker';"
)

$content = $content.Replace(
    "const [showPaymentMethodPicker, setShowPaymentMethodPicker] = useState(false);",
    "const [showPaymentMethodPicker, setShowPaymentMethodPicker] = useState(false);`n  const [scanningReceipt, setScanningReceipt] = useState(false);"
)

$content | Set-Content $file
Write-Host "Done step 1!"