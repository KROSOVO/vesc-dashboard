package com.krosovo.vescdash.bridge

import android.content.Context
import android.os.Build
import android.os.SystemClock
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import org.json.JSONObject

/**
 * Pont JS ↔ Kotlin (Phase 2).
 *
 * JS → Kotlin  : AndroidBridge.send('{"type":"...","payload":{...}}')
 * Kotlin → JS  : window.__nativeEvent({"type":"...","timestamp":...,"payload":{...}})
 *
 * Format de message commun à tout le projet hybride (voir docs/COMMUNICATION_PROTOCOL.md).
 */
class JsBridge(
    private val context: Context,
    private val postEvent: (String) -> Unit,
) {

    @JavascriptInterface
    fun send(payload: String) {
        val msg = try {
            JSONObject(payload)
        } catch (_: Exception) {
            JSONObject().put("type", "error").put("payload", "JSON invalide")
        }
        when (msg.optString("type")) {
            "ping" -> post("pong", JSONObject())
            "getSystemInfo" -> post("systemInfo", systemInfo())
            "haptic" -> vibrate(msg.optJSONObject("payload")?.optInt("ms", 20) ?: 20)
            "log" -> android.util.Log.i(TAG, msg.opt("payload")?.toString() ?: "")
            else -> post(
                "error",
                JSONObject().put("message", "type inconnu : ${msg.optString("type")}")
            )
        }
    }

    private fun post(type: String, payload: JSONObject) {
        val msg = JSONObject()
            .put("type", type)
            .put("timestamp", System.currentTimeMillis())
            .put("payload", payload)
        postEvent(msg.toString())
    }

    private fun systemInfo(): JSONObject {
        val dm = context.resources.displayMetrics
        return JSONObject()
            .put("model", Build.MODEL)
            .put("manufacturer", Build.MANUFACTURER)
            .put("androidVersion", Build.VERSION.RELEASE)
            .put("sdkInt", Build.VERSION.SDK_INT)
            .put("uptimeMs", SystemClock.elapsedRealtime())
            .put("screenWidthPx", dm.widthPixels)
            .put("screenHeightPx", dm.heightPixels)
            .put("densityDpi", dm.densityDpi)
    }

    private fun vibrate(ms: Int) {
        val duration = ms.coerceIn(10, 200)
        val vibrator: Vibrator = if (Build.VERSION.SDK_INT >= 31) {
            val manager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            manager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
        vibrator.vibrate(VibrationEffect.createOneShot(duration.toLong(), VibrationEffect.DEFAULT_AMPLITUDE))
    }

    companion object {
        private const val TAG = "VescDash/Bridge"
    }
}
