package com.doswallet.app

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import com.doswallet.app.utils.SharedPrefsManager

class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d("MainActivity", "onCreate started")
        
        try {
            // Check if user is logged in
            val token = SharedPrefsManager.getInstance(this).getToken()
            Log.d("MainActivity", "Token check: ${token != null}")
            
            if (token != null) {
                // User is logged in, go to main app
                Log.d("MainActivity", "User logged in, navigating to DashboardActivity")
                try {
                    val intent = Intent(this, com.doswallet.app.main.DashboardActivity::class.java)
                    Log.d("MainActivity", "Intent created: ${intent.component?.className}")
                    startActivity(intent)
                    Log.d("MainActivity", "DashboardActivity started")
                } catch (e: Exception) {
                    Log.e("MainActivity", "Error starting DashboardActivity: ${e.message}", e)
                    e.printStackTrace()
                    // Fallback to login if dashboard fails
                    startActivity(Intent(this, com.doswallet.app.auth.LoginActivity::class.java))
                }
            } else {
                // User is not logged in, go to login
                Log.d("MainActivity", "User not logged in, navigating to LoginActivity")
                startActivity(Intent(this, com.doswallet.app.auth.LoginActivity::class.java))
            }
            
            finish()
        } catch (e: Exception) {
            Log.e("MainActivity", "Error in onCreate: ${e.message}", e)
            e.printStackTrace()
        }
    }
}

