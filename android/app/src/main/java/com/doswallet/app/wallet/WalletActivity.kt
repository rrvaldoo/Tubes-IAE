package com.doswallet.app.wallet

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.doswallet.app.R
import com.doswallet.app.adapter.TransactionAdapter
import com.doswallet.app.api.ApiService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.NumberFormat
import java.util.Locale

class WalletActivity : AppCompatActivity() {
    
    private lateinit var apiService: ApiService
    private lateinit var transactionAdapter: TransactionAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_wallet)
        
        apiService = ApiService(this)
        
        setupToolbar()
        setupViews()
        loadData()
    }
    
    private fun setupToolbar() {
        val toolbar = findViewById<androidx.appcompat.widget.Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "My Wallet"
    }
    
    private fun setupViews() {
        val rvTransactions = findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.rvTransactions)
        
        transactionAdapter = TransactionAdapter(emptyList())
        rvTransactions.layoutManager = LinearLayoutManager(this)
        rvTransactions.adapter = transactionAdapter
    }
    
    private fun loadData() {
        val progressBar = findViewById<android.widget.ProgressBar>(R.id.progressBar)
        val tvBalance = findViewById<android.widget.TextView>(R.id.tvBalance)
        val tvPoints = findViewById<android.widget.TextView>(R.id.tvPoints)
        val tvWalletId = findViewById<android.widget.TextView>(R.id.tvWalletId)
        val tvNoTransactions = findViewById<android.widget.TextView>(R.id.tvNoTransactions)
        
        progressBar.visibility = View.VISIBLE
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val wallet = apiService.getWallet()
                val transactions = apiService.getTransactions()
                
                withContext(Dispatchers.Main) {
                    progressBar.visibility = View.GONE
                    
                    if (wallet != null) {
                        val formatter = NumberFormat.getCurrencyInstance(Locale("id", "ID"))
                        tvBalance.text = formatter.format(wallet.balance)
                        tvPoints.text = wallet.points.toString()
                        tvWalletId.text = wallet.wallet_id.toString()
                    } else {
                        tvBalance.text = "Rp 0"
                        tvPoints.text = "0"
                        tvWalletId.text = "-"
                    }
                    
                    if (transactions.isNotEmpty()) {
                        transactionAdapter.updateTransactions(transactions)
                        tvNoTransactions.visibility = View.GONE
                    } else {
                        tvNoTransactions.visibility = View.VISIBLE
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    progressBar.visibility = View.GONE
                    android.util.Log.e("WalletActivity", "Error loading data", e)
                    Toast.makeText(this@WalletActivity, "Error loading wallet data", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
    
    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}

