package com.doswallet.app.models

data class Transaction(
    val transaction_id: Int,
    val user_id: Int,
    val amount: Double,
    val type: String,
    val payment_method: String? = null,
    val date: String,
    val receiver_id: Int? = null,
    val description: String? = null
)

