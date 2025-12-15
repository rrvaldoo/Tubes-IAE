package com.doswallet.app.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.doswallet.app.R
import com.doswallet.app.models.Transaction
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

class TransactionAdapter(private var transactions: List<Transaction>) :
    RecyclerView.Adapter<TransactionAdapter.ViewHolder>() {
    
    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvType: TextView = itemView.findViewById(R.id.tvType)
        val tvDate: TextView = itemView.findViewById(R.id.tvDate)
        val tvAmount: TextView = itemView.findViewById(R.id.tvAmount)
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_transaction, parent, false)
        return ViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val transaction = transactions[position]
        
        holder.tvType.text = transaction.type.uppercase()
        
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        val displayFormat = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale.getDefault())
        try {
            val date = dateFormat.parse(transaction.date)
            holder.tvDate.text = date?.let { displayFormat.format(it) } ?: transaction.date
        } catch (e: Exception) {
            holder.tvDate.text = transaction.date
        }
        
        val formatter = NumberFormat.getCurrencyInstance(Locale("id", "ID"))
        val sign = if (transaction.type == "withdraw") "-" else "+"
        val amountText = "$sign${formatter.format(transaction.amount)}"
        
        holder.tvAmount.text = amountText
        holder.tvAmount.setTextColor(
            holder.itemView.context.getColor(
                if (transaction.type == "withdraw") R.color.error else R.color.success
            )
        )
    }
    
    override fun getItemCount() = transactions.size
    
    fun updateTransactions(newTransactions: List<Transaction>) {
        transactions = newTransactions
        notifyDataSetChanged()
    }
}

