package com.doswallet.app.models

data class Notification(
    val notification_id: Int,
    val user_id: Int,
    val message: String,
    val date: String,
    val read_status: Boolean
)

