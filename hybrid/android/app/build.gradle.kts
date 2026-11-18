import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// L'UI web (source de vérité unique) est copiée depuis hybrid/web vers assets/web/.
val copyWebAssets by tasks.registering(Copy::class) {
    from(rootDir.resolve("../web")) { into("web") }
    into(layout.buildDirectory.dir("generated/webAssets"))
}

android {
    namespace = "com.krosovo.vescdash"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.krosovo.vescdash"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0-hybrid"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    sourceSets {
        getByName("main") {
            assets.srcDir(layout.buildDirectory.dir("generated/webAssets"))
        }
    }
}

dependencies {
    // WebViewAssetLoader : sert les assets locaux via https://appassets.androidplatform.net
    // (les modules ES et localStorage ne fonctionnent pas sur file://).
    implementation("androidx.webkit:webkit:1.12.1")
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

tasks.matching { it.name == "preBuild" }.configureEach {
    dependsOn(copyWebAssets)
}
