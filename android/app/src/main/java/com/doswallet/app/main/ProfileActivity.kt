package com.doswallet.app.main

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.doswallet.app.R
import com.doswallet.app.auth.LoginActivity
import com.doswallet.app.utils.SharedPrefsManager

class ProfileActivity : AppCompatActivity() {
    
    private lateinit var sharedPrefs: SharedPrefsManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)
        
        sharedPrefs = SharedPrefsManager.getInstance(this)
        
        setupToolbar()
        setupViews()
    }
    
    private fun setupToolbar() {
        val toolbar = findViewById<androidx.appcompat.widget.Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Profile"
    }
    
    private fun setupViews() {
        val tvName = findViewById<android.widget.TextView>(R.id.tvName)
        val tvEmail = findViewById<android.widget.TextView>(R.id.tvEmail)
        val tvPhone = findViewById<android.widget.TextView>(R.id.tvPhone)
        val tvUserId = findViewById<android.widget.TextView>(R.id.tvUserId)
        val tvEmailInfo = findViewById<android.widget.TextView>(R.id.tvEmailInfo)
        val tvPhoneInfo = findViewById<android.widget.TextView>(R.id.tvPhoneInfo)
        val tvAvatar = findViewById<android.widget.TextView>(R.id.tvAvatar)
        val btnLogout = findViewById<android.widget.Button>(R.id.btnLogout)
        
        val user = sharedPrefs.getUser()
        if (user != null) {
            tvName.text = user.name
            tvEmail.text = user.email
            tvPhone.text = user.phone
            tvUserId.text = user.user_id.toString()
            tvEmailInfo.text = user.email
            tvPhoneInfo.text = user.phone
            tvAvatar.text = user.name.firstOrNull()?.uppercaseChar()?.toString() ?: "U"
        }
        
        btnLogout.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Logout")
                .setMessage("Are you sure you want to logout?")
                .setPositiveButton("Logout") { _, _ ->
                    sharedPrefs.clear()
                    val intent = Intent(this, LoginActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    }
                    startActivity(intent)
                    finish()
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }
    
    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}

