package com.doswallet.app.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.doswallet.app.R
import com.doswallet.app.api.ApiService
import com.doswallet.app.models.Notification
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class NotificationAdapter(
    private var notifications: List<Notification>,
    private val apiService: ApiService
) : RecyclerView.Adapter<NotificationAdapter.ViewHolder>() {
    
    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvMessage: TextView = itemView.findViewById(R.id.tvMessage)
        val tvDate: TextView = itemView.findViewById(R.id.tvDate)
        val unreadDot: View = itemView.findViewById(R.id.unreadDot)
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_notification, parent, false)
        return ViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val notification = notifications[position]
        
        holder.tvMessage.text = notification.message
        
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        val displayFormat = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale.getDefault())
        try {
            val date = dateFormat.parse(notification.date)
            holder.tvDate.text = date?.let { displayFormat.format(it) } ?: notification.date
        } catch (e: Exception) {
            holder.tvDate.text = notification.date
        }
        
        holder.unreadDot.visibility = if (notification.read_status) View.GONE else View.VISIBLE
        
        if (!notification.read_status) {
            holder.itemView.setOnClickListener {
                CoroutineScope(Dispatchers.IO).launch {
                    apiService.markNotificationAsRead(notification.notification_id)
                }
            }
        }
    }
    
    override fun getItemCount() = notifications.size
    
    fun updateNotifications(newNotifications: List<Notification>) {
        notifications = newNotifications
        notifyDataSetChanged()
    }
}

