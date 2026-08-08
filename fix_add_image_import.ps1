$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace(
    "import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform } from 'react-native';",
    "import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform, Image } from 'react-native';"
)
Set-Content $file $content
Write-Host "Done"