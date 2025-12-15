package com.doswallet.app.main

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.doswallet.app.R
import com.doswallet.app.adapter.TransactionAdapter
import com.doswallet.app.api.ApiService
import com.doswallet.app.models.Transaction
import com.doswallet.app.utils.SharedPrefsManager
import com.doswallet.app.wallet.WalletActivity
import com.google.android.material.bottomnavigation.BottomNavigationView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.NumberFormat
import java.util.Locale

class DashboardActivity : AppCompatActivity() {
    
    private lateinit var apiService: ApiService
    private lateinit var sharedPrefs: SharedPrefsManager
    private lateinit var transactionAdapter: TransactionAdapter
    
    init {
        android.util.Log.d("DashboardActivity", "DashboardActivity class initialized")
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        android.util.Log.d("DashboardActivity", "onCreate called")
        super.onCreate(savedInstanceState)
        android.util.Log.d("DashboardActivity", "onCreate started, super.onCreate completed")
        
        try {
            android.util.Log.d("DashboardActivity", "Setting content view")
            android.util.Log.d("DashboardActivity", "Layout resource ID: ${R.layout.activity_dashboard}")
            
            // Try to set content view
            try {
                setContentView(R.layout.activity_dashboard)
                android.util.Log.d("DashboardActivity", "Content view set successfully")
            } catch (layoutException: Exception) {
                android.util.Log.e("DashboardActivity", "Error setting content view: ${layoutException.message}", layoutException)
                // Create a simple fallback layout programmatically
                createFallbackLayout()
                return
            }
            
            // Verify that the view hierarchy is created
            try {
                val rootView = window.decorView.rootView
                android.util.Log.d("DashboardActivity", "Root view created: ${rootView != null}, class: ${rootView?.javaClass?.simpleName}")
                
                if (rootView == null) {
                    android.util.Log.e("DashboardActivity", "Root view is null! Creating fallback")
                    createFallbackLayout()
                    return
                }
            } catch (e: Exception) {
                android.util.Log.e("DashboardActivity", "Error checking root view: ${e.message}", e)
            }
            
            android.util.Log.d("DashboardActivity", "Initializing ApiService")
            apiService = ApiService(this)
            android.util.Log.d("DashboardActivity", "Initializing SharedPrefsManager")
            sharedPrefs = SharedPrefsManager.getInstance(this)
            
            android.util.Log.d("DashboardActivity", "Setting up views")
            setupViews()
            android.util.Log.d("DashboardActivity", "Setting up bottom navigation")
            setupBottomNavigation()
            android.util.Log.d("DashboardActivity", "Loading data")
            loadData()
            android.util.Log.d("DashboardActivity", "onCreate completed successfully")
        } catch (e: Exception) {
            android.util.Log.e("DashboardActivity", "Error in onCreate: ${e.message}", e)
            e.printStackTrace()
            
            // Show error message even if layout failed
            try {
                val errorMsg = "Error: ${e.javaClass.simpleName}: ${e.message}"
                android.util.Log.e("DashboardActivity", errorMsg)
                Toast.makeText(this, errorMsg, Toast.LENGTH_LONG).show()
            } catch (toastException: Exception) {
                android.util.Log.e("DashboardActivity", "Error showing toast", toastException)
            }
        }
    }
    
    private fun createFallbackLayout() {
        android.util.Log.d("DashboardActivity", "Creating fallback layout")
        try {
            val layout = android.widget.LinearLayout(this).apply {
                orientation = android.widget.LinearLayout.VERTICAL
                setPadding(32, 32, 32, 32)
                setBackgroundColor(android.graphics.Color.parseColor("#F5F5F5"))
            }
            
            val textView = android.widget.TextView(this).apply {
                text = "Dashboard Activity\n\nIf you see this, the main layout failed to load.\nCheck Logcat for errors."
                textSize = 18f
                setTextColor(android.graphics.Color.parseColor("#212121"))
                gravity = android.view.Gravity.CENTER
                setPadding(16, 16, 16, 16)
            }
            
            layout.addView(textView)
            setContentView(layout)
            android.util.Log.d("DashboardActivity", "Fallback layout created successfully")
        } catch (e: Exception) {
            android.util.Log.e("DashboardActivity", "Error creating fallback layout: ${e.message}", e)
        }
    }
    
    private fun setupViews() {
        try {
            android.util.Log.d("DashboardActivity", "Finding views...")
            val tvGreeting = findViewById<android.widget.TextView>(R.id.tvGreeting)
            android.util.Log.d("DashboardActivity", "tvGreeting found: ${tvGreeting != null}")
            
            val btnTransfer = findViewById<android.widget.Button>(R.id.btnTransfer)
            android.util.Log.d("DashboardActivity", "btnTransfer found: ${btnTransfer != null}")
            
            val btnQRIS = findViewById<android.widget.Button>(R.id.btnQRIS)
            android.util.Log.d("DashboardActivity", "btnQRIS found: ${btnQRIS != null}")
            
            val rvTransactions = findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.rvTransactions)
            android.util.Log.d("DashboardActivity", "rvTransactions found: ${rvTransactions != null}")
            
            val tvSeeAll = findViewById<android.widget.TextView>(R.id.tvSeeAll)
            android.util.Log.d("DashboardActivity", "tvSeeAll found: ${tvSeeAll != null}")
            
            val user = sharedPrefs.getUser()
            tvGreeting?.text = "Hello, ${user?.name ?: "User"}!"
            android.util.Log.d("DashboardActivity", "Greeting set")
            
            android.util.Log.d("DashboardActivity", "Creating TransactionAdapter")
            transactionAdapter = TransactionAdapter(emptyList())
            android.util.Log.d("DashboardActivity", "Setting RecyclerView layout manager")
            rvTransactions?.layoutManager = LinearLayoutManager(this)
            android.util.Log.d("DashboardActivity", "Setting RecyclerView adapter")
            rvTransactions?.adapter = transactionAdapter
            android.util.Log.d("DashboardActivity", "RecyclerView setup complete")
            
            btnTransfer?.setOnClickListener {
                startActivity(Intent(this, TransferActivity::class.java))
            }
            
            btnQRIS?.setOnClickListener {
                startActivity(Intent(this, QRISActivity::class.java))
            }
            
            tvSeeAll?.setOnClickListener {
                startActivity(Intent(this, WalletActivity::class.java))
            }
            
            android.util.Log.d("DashboardActivity", "setupViews completed successfully")
        } catch (e: Exception) {
            android.util.Log.e("DashboardActivity", "Error in setupViews: ${e.message}", e)
            e.printStackTrace()
        }
    }
    
    private fun setupBottomNavigation() {
        try {
            android.util.Log.d("DashboardActivity", "Setting up bottom navigation")
            val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNavigation)
            android.util.Log.d("DashboardActivity", "bottomNav found: ${bottomNav != null}")
            
            if (bottomNav != null) {
                bottomNav.setOnItemSelectedListener { item ->
                    android.util.Log.d("DashboardActivity", "Bottom nav item selected: ${item.itemId}")
                    when (item.itemId) {
                        R.id.nav_dashboard -> {
                            // Already here
                            true
                        }
                        R.id.nav_wallet -> {
                            startActivity(Intent(this, WalletActivity::class.java))
                            true
                        }
                        R.id.nav_transfer -> {
                            startActivity(Intent(this, TransferActivity::class.java))
                            true
                        }
                        R.id.nav_notifications -> {
                            startActivity(Intent(this, NotificationActivity::class.java))
                            true
                        }
                        R.id.nav_profile -> {
                            startActivity(Intent(this, ProfileActivity::class.java))
                            true
                        }
                        else -> {
                            android.util.Log.w("DashboardActivity", "Unknown nav item: ${item.itemId}")
                            false
                        }
                    }
                }
                android.util.Log.d("DashboardActivity", "Bottom navigation setup complete")
            } else {
                android.util.Log.w("DashboardActivity", "Bottom navigation view not found!")
            }
        } catch (e: Exception) {
            android.util.Log.e("DashboardActivity", "Error in setupBottomNavigation: ${e.message}", e)
            e.printStackTrace()
        }
    }
    
    private fun loadData() {
        try {
            val progressBar = findViewById<android.widget.ProgressBar>(R.id.progressBar)
            val tvBalance = findViewById<android.widget.TextView>(R.id.tvBalance)
            val tvPoints = findViewById<android.widget.TextView>(R.id.tvPoints)
            val tvNoTransactions = findViewById<android.widget.TextView>(R.id.tvNoTransactions)
            
            progressBar?.visibility = View.VISIBLE
            
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val wallet = apiService.getWallet()
                    val transactions = apiService.getTransactions(limit = 5)
                    
                    withContext(Dispatchers.Main) {
                        progressBar?.visibility = View.GONE
                        
                        if (wallet != null) {
                            val formatter = NumberFormat.getCurrencyInstance(Locale("id", "ID"))
                            tvBalance?.text = formatter.format(wallet.balance)
                            tvPoints?.text = wallet.points.toString()
                        } else {
                            tvBalance?.text = "Rp 0"
                            tvPoints?.text = "0"
                        }
                        
                        if (transactions.isNotEmpty()) {
                            transactionAdapter.updateTransactions(transactions)
                            tvNoTransactions?.visibility = View.GONE
                        } else {
                            tvNoTransactions?.visibility = View.VISIBLE
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        progressBar?.visibility = View.GONE
                        android.util.Log.e("DashboardActivity", "Error loading data", e)
                        e.printStackTrace()
                        tvBalance?.text = "Rp 0"
                        tvPoints?.text = "0"
                    }
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("DashboardActivity", "Error in loadData setup", e)
            e.printStackTrace()
        }
    }
    
    override fun onResume() {
        super.onResume()
        loadData()
    }
}

