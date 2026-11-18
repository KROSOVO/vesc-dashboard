# Le pont JS↔Kotlin est appelé par réflexion depuis le WebView : à conserver.
-keepclassmembers class com.krosovo.vescdash.bridge.JsBridge {
    @android.webkit.JavascriptInterface <methods>;
}
