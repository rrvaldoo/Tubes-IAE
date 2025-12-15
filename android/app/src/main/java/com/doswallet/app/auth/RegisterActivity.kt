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

class RegisterActivity : AppCompatActivity() {
    
    private lateinit var apiService: ApiService
    private lateinit var sharedPrefs: SharedPrefsManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)
        
        apiService = ApiService(this)
        sharedPrefs = SharedPrefsManager.getInstance(this)
        
        setupViews()
    }
    
    private fun setupViews() {
        val etName = findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etName)
        val etEmail = findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etEmail)
        val etPhone = findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etPhone)
        val etPassword = findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etPassword)
        val etConfirmPassword = findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etConfirmPassword)
        val btnRegister = findViewById<android.widget.Button>(R.id.btnRegister)
        val tvLogin = findViewById<android.widget.TextView>(R.id.tvLogin)
        val progressBar = findViewById<android.widget.ProgressBar>(R.id.progressBar)
        
        btnRegister.setOnClickListener {
            val name = etName.text?.toString() ?: ""
            val email = etEmail.text?.toString() ?: ""
            val phone = etPhone.text?.toString() ?: ""
            val password = etPassword.text?.toString() ?: ""
            val confirmPassword = etConfirmPassword.text?.toString() ?: ""
            
            if (name.isEmpty() || email.isEmpty() || phone.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
                Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            if (password != confirmPassword) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            if (password.length < 6) {
                Toast.makeText(this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            progressBar.visibility = android.view.View.VISIBLE
            btnRegister.isEnabled = false
            
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val response = apiService.register(name, email, phone, password)
                    
                    withContext(Dispatchers.Main) {
                        progressBar.visibility = android.view.View.GONE
                        btnRegister.isEnabled = true
                        
                        if (response != null && response.token.isNotEmpty() && response.user != null) {
                            sharedPrefs.saveToken(response.token)
                            sharedPrefs.saveUser(response.user)
                            Toast.makeText(this@RegisterActivity, response.message.ifEmpty { "Registration successful!" }, Toast.LENGTH_SHORT).show()
                            startActivity(Intent(this@RegisterActivity, DashboardActivity::class.java))
                            finish()
                        } else {
                            val errorMsg = response?.message?.ifEmpty { null } 
                                ?: "Registration failed. Please check your connection and try again."
                            Toast.makeText(this@RegisterActivity, errorMsg, Toast.LENGTH_LONG).show()
                            android.util.Log.e("RegisterActivity", "Registration failed: ${response?.message}")
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        progressBar.visibility = android.view.View.GONE
                        btnRegister.isEnabled = true
                        Toast.makeText(this@RegisterActivity, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                        android.util.Log.e("RegisterActivity", "Registration error", e)
                    }
                }
            }
        }
        
        tvLogin.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
}

