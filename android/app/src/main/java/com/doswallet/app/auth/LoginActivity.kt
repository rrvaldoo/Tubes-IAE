package com.doswallet.app.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.doswallet.app.R
import com.doswallet.app.api.ApiService
import com.doswallet.app.main.DashboardActivity
import com.doswallet.app.utils.SharedPrefsManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class LoginActivity : AppCompatActivity() {
    
    private lateinit var apiService: ApiService
    private lateinit var sharedPrefs: SharedPrefsManager
    private var useEmail = true
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        
        apiService = ApiService(this)
        sharedPrefs = SharedPrefsManager.getInstance(this)
        
        setupViews()
    }
    
    private fun setupViews() {
        val btnEmail = findViewById<android.widget.Button>(R.id.btnEmail)
        val btnPhone = findViewById<android.widget.Button>(R.id.btnPhone)
        val tilEmail = findViewById<com.google.android.material.textfield.TextInputLayout>(R.id.tilEmail)
        val tilPhone = findViewById<com.google.android.material.textfield.TextInputLayout>(R.id.tilPhone)
        val etEmail = findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etEmail)
        val etPhone = findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etPhone)
        val etPassword = findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etPassword)
        val btnLogin = findViewById<android.widget.Button>(R.id.btnLogin)
        val tvRegister = findViewById<android.widget.TextView>(R.id.tvRegister)
        val progressBar = findViewById<android.widget.ProgressBar>(R.id.progressBar)
        
        btnEmail.setOnClickListener {
            useEmail = true
            tilEmail.visibility = android.view.View.VISIBLE
            tilPhone.visibility = android.view.View.GONE
            btnEmail.setBackgroundColor(getColor(R.color.text_light))
            btnEmail.setTextColor(getColor(R.color.primary))
            btnPhone.setBackgroundColor(android.graphics.Color.TRANSPARENT)
            btnPhone.setTextColor(getColor(R.color.text_light))
        }
        
        btnPhone.setOnClickListener {
            useEmail = false
            tilEmail.visibility = android.view.View.GONE
            tilPhone.visibility = android.view.View.VISIBLE
            btnPhone.setBackgroundColor(getColor(R.color.text_light))
            btnPhone.setTextColor(getColor(R.color.primary))
            btnEmail.setBackgroundColor(android.graphics.Color.TRANSPARENT)
            btnEmail.setTextColor(getColor(R.color.text_light))
        }
        
        btnLogin.setOnClickListener {
            val email = etEmail.text?.toString()
            val phone = etPhone.text?.toString()
            val password = etPassword.text?.toString()
            
            if (password.isNullOrEmpty() || (useEmail && email.isNullOrEmpty()) || (!useEmail && phone.isNullOrEmpty())) {
                Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            progressBar.visibility = android.view.View.VISIBLE
            btnLogin.isEnabled = false
            
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val response = if (useEmail) {
                        apiService.login(email, null, password)
                    } else {
                        apiService.login(null, phone, password)
                    }
                    
                    withContext(Dispatchers.Main) {
                        progressBar.visibility = android.view.View.GONE
                        btnLogin.isEnabled = true
                        
                        if (response != null && response.token.isNotEmpty() && response.user != null) {
                            android.util.Log.d("LoginActivity", "Login successful, saving token and user")
                            sharedPrefs.saveToken(response.token)
                            sharedPrefs.saveUser(response.user)
                            android.util.Log.d("LoginActivity", "Token and user saved, navigating to DashboardActivity")
                            
                            try {
                                val intent = Intent(this@LoginActivity, DashboardActivity::class.java)
                                android.util.Log.d("LoginActivity", "Intent created: ${intent.component?.className}")
                                Toast.makeText(this@LoginActivity, response.message.ifEmpty { "Login successful!" }, Toast.LENGTH_SHORT).show()
                                startActivity(intent)
                                android.util.Log.d("LoginActivity", "DashboardActivity started, finishing LoginActivity")
                                finish()
                            } catch (e: Exception) {
                                android.util.Log.e("LoginActivity", "Error starting DashboardActivity: ${e.message}", e)
                                e.printStackTrace()
                                Toast.makeText(this@LoginActivity, "Error navigating to dashboard: ${e.message}", Toast.LENGTH_LONG).show()
                            }
                        } else {
                            val errorMsg = response?.message?.ifEmpty { null }
                                ?: "Login failed. Please check your credentials and connection."
                            Toast.makeText(this@LoginActivity, errorMsg, Toast.LENGTH_LONG).show()
                            android.util.Log.e("LoginActivity", "Login failed: ${response?.message}")
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        progressBar.visibility = android.view.View.GONE
                        btnLogin.isEnabled = true
                        Toast.makeText(this@LoginActivity, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                        android.util.Log.e("LoginActivity", "Login error", e)
                    }
                }
            }
        }
        
        tvRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }
}

