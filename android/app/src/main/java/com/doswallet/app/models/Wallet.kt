package com.doswallet.app.models

data class Wallet(
    val wallet_id: Int,
    val user_id: Int,
    val balance: Double,
    val points: Int,
    val created_at: String? = null,
    val updated_at: String? = null
)

