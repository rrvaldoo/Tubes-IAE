package com.doswallet.app.main

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.doswallet.app.R

class QRISActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qris)
        
        setupToolbar()
    }
    
    private fun setupToolbar() {
        val toolbar = findViewById<androidx.appcompat.widget.Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "QRIS Payment"
    }
    
    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}

