package com.doswallet.app.models

data class User(
    val user_id: Int,
    val name: String,
    val email: String,
    val phone: String,
    val created_at: String? = null
)

