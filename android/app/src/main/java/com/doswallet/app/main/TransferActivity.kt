package com.doswallet.app.main

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.doswallet.app.R
import com.doswallet.app.api.ApiService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class TransferActivity : AppCompatActivity() {
    
    private lateinit var apiService: ApiService
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_transfer)
        
        apiService = ApiService(this)
        
        setupToolbar()
        setupViews()
    }
    
    private fun setupToolbar() {
        val toolbar = findViewById<androidx.appcompat.widget.Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Transfer"
    }
    
    private fun setupViews() {
        val etReceiverId = findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etReceiverId)
        val etAmount = findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etAmount)
        val etDescription = findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etDescription)
        val btnTransfer = findViewById<android.widget.Button>(R.id.btnTransfer)
        val btnQRIS = findViewById<android.widget.Button>(R.id.btnQRIS)
        val progressBar = findViewById<android.widget.ProgressBar>(R.id.progressBar)
        
        btnTransfer.setOnClickListener {
            val receiverId = etReceiverId.text?.toString()?.toIntOrNull()
            val amount = etAmount.text?.toString()?.toDoubleOrNull()
            val description = etDescription.text?.toString()
            
            if (receiverId == null || amount == null || amount <= 0) {
                Toast.makeText(this, "Please enter valid receiver ID and amount", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            progressBar.visibility = View.VISIBLE
            btnTransfer.isEnabled = false
            
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val transaction = apiService.transfer(receiverId, amount, description)
                    
                    withContext(Dispatchers.Main) {
                        progressBar.visibility = View.GONE
                        btnTransfer.isEnabled = true
                        
                        if (transaction != null) {
                            Toast.makeText(this@TransferActivity, "Transfer successful!", Toast.LENGTH_SHORT).show()
                            finish()
                        } else {
                            Toast.makeText(this@TransferActivity, "Transfer failed. Please check your balance and try again.", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        progressBar.visibility = View.GONE
                        btnTransfer.isEnabled = true
                        Toast.makeText(this@TransferActivity, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                        android.util.Log.e("TransferActivity", "Transfer error", e)
                    }
                }
            }
        }
        
        btnQRIS.setOnClickListener {
            startActivity(android.content.Intent(this, QRISActivity::class.java))
        }
    }
    
    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}

