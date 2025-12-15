package com.doswallet.app.main

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.doswallet.app.R
import com.doswallet.app.adapter.NotificationAdapter
import com.doswallet.app.api.ApiService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class NotificationActivity : AppCompatActivity() {
    
    private lateinit var apiService: ApiService
    private lateinit var notificationAdapter: NotificationAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_notification)
        
        apiService = ApiService(this)
        
        setupToolbar()
        setupViews()
        loadData()
    }
    
    private fun setupToolbar() {
        val toolbar = findViewById<androidx.appcompat.widget.Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Notifications"
    }
    
    private fun setupViews() {
        val rvNotifications = findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.rvNotifications)
        
        notificationAdapter = NotificationAdapter(emptyList(), apiService)
        rvNotifications.layoutManager = LinearLayoutManager(this)
        rvNotifications.adapter = notificationAdapter
    }
    
    private fun loadData() {
        val progressBar = findViewById<android.widget.ProgressBar>(R.id.progressBar)
        val tvNoNotifications = findViewById<android.widget.TextView>(R.id.tvNoNotifications)
        
        progressBar.visibility = View.VISIBLE
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val notifications = apiService.getNotifications()
                
                withContext(Dispatchers.Main) {
                    progressBar.visibility = View.GONE
                    
                    if (notifications.isNotEmpty()) {
                        notificationAdapter.updateNotifications(notifications)
                        tvNoNotifications.visibility = View.GONE
                    } else {
                        tvNoNotifications.visibility = View.VISIBLE
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    progressBar.visibility = View.GONE
                    android.util.Log.e("NotificationActivity", "Error loading notifications", e)
                }
            }
        }
    }
    
    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}

