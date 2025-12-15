package com.doswallet.app.api

import android.content.Context
import com.doswallet.app.models.*
import org.json.JSONObject

class ApiService(private val context: Context) {
    
    private val userClient = GraphQLClient(GraphQLClient.USER_SERVICE_URL, context)
    private val walletClient = GraphQLClient(GraphQLClient.WALLET_SERVICE_URL, context)
    private val transactionClient = GraphQLClient(GraphQLClient.TRANSACTION_SERVICE_URL, context)
    private val notificationClient = GraphQLClient(GraphQLClient.NOTIFICATION_SERVICE_URL, context)
    
    // User Service
    fun register(name: String, email: String, phone: String, password: String): AuthResponse? {
        val mutation = """
            mutation Register(${'$'}input: RegisterInput!) {
                register(input: ${'$'}input) {
                    token
                    user {
                        userId
                        name
                        email
                        phone
                    }
                    message
                }
            }
        """.trimIndent()
        
        val variables = mapOf(
            "input" to mapOf(
                "name" to name,
                "email" to email,
                "phone" to phone,
                "password" to password
            )
        )
        
        val response = userClient.executeMutation(mutation, variables)
        return parseAuthResponse(response)
    }
    
    fun login(email: String?, phone: String?, password: String): AuthResponse? {
        val mutation = """
            mutation Login(${'$'}input: LoginInput!) {
                login(input: ${'$'}input) {
                    token
                    user {
                        userId
                        name
                        email
                        phone
                    }
                    message
                }
            }
        """.trimIndent()
        
        val inputMap = mutableMapOf<String, Any>("password" to password)
        email?.let { inputMap["email"] = it }
        phone?.let { inputMap["phone"] = it }
        
        val variables = mapOf("input" to inputMap)
        val response = userClient.executeMutation(mutation, variables)
        return parseAuthResponse(response)
    }
    
    // Wallet Service
    fun getWallet(): Wallet? {
        val query = """
            query {
                myWallet {
                    walletId
                    userId
                    balance
                    points
                    createdAt
                    updatedAt
                }
            }
        """.trimIndent()
        
        val response = walletClient.executeQuery(query)
        return response?.optJSONObject("data")?.optJSONObject("myWallet")?.let {
            Wallet(
                wallet_id = it.optInt("walletId"),
                user_id = it.optInt("userId"),
                balance = it.optDouble("balance"),
                points = it.optInt("points"),
                created_at = it.optString("createdAt"),
                updated_at = it.optString("updatedAt")
            )
        }
    }
    
    // Transaction Service
    fun getTransactions(limit: Int = 50, offset: Int = 0): List<Transaction> {
        val query = """
            query GetTransactions(${'$'}limit: Int, ${'$'}offset: Int) {
                myTransactions(limit: ${'$'}limit, offset: ${'$'}offset) {
                    transactionId
                    userId
                    amount
                    type
                    paymentMethod
                    date
                    receiverId
                    description
                }
            }
        """.trimIndent()
        
        val variables = mapOf("limit" to limit, "offset" to offset)
        val response = transactionClient.executeQuery(query, variables)
        
        val transactions = mutableListOf<Transaction>()
        response?.optJSONObject("data")?.optJSONArray("myTransactions")?.let { array ->
            for (i in 0 until array.length()) {
                val item = array.getJSONObject(i)
                transactions.add(
                    Transaction(
                        transaction_id = item.optInt("transactionId"),
                        user_id = item.optInt("userId"),
                        amount = item.optDouble("amount"),
                        type = item.optString("type"),
                        payment_method = item.optString("paymentMethod"),
                        date = item.optString("date"),
                        receiver_id = item.optInt("receiverId").takeIf { it > 0 },
                        description = item.optString("description")
                    )
                )
            }
        }
        return transactions
    }
    
    fun transfer(receiverId: Int, amount: Double, description: String?): Transaction? {
        val mutation = """
            mutation Transfer(${'$'}receiverId: Int!, ${'$'}amount: Decimal!, ${'$'}description: String) {
                transfer(receiverId: ${'$'}receiverId, amount: ${'$'}amount, description: ${'$'}description) {
                    transactionId
                    amount
                    type
                    date
                }
            }
        """.trimIndent()
        
        val variables = mutableMapOf<String, Any>(
            "receiverId" to receiverId,
            "amount" to amount
        )
        description?.let { variables["description"] = it }
        
        val response = transactionClient.executeMutation(mutation, variables)
        return response?.optJSONObject("data")?.optJSONObject("transfer")?.let {
            Transaction(
                transaction_id = it.optInt("transactionId"),
                user_id = 0,
                amount = it.optDouble("amount"),
                type = it.optString("type"),
                date = it.optString("date"),
                description = description
            )
        }
    }
    
    // Notification Service
    fun getNotifications(limit: Int = 50, offset: Int = 0): List<Notification> {
        val query = """
            query GetNotifications(${'$'}limit: Int, ${'$'}offset: Int) {
                myNotifications(limit: ${'$'}limit, offset: ${'$'}offset) {
                    notificationId
                    message
                    date
                    readStatus
                }
            }
        """.trimIndent()
        
        val variables = mapOf("limit" to limit, "offset" to offset)
        val response = notificationClient.executeQuery(query, variables)
        
        val notifications = mutableListOf<Notification>()
        response?.optJSONObject("data")?.optJSONArray("myNotifications")?.let { array ->
            for (i in 0 until array.length()) {
                val item = array.getJSONObject(i)
                notifications.add(
                    Notification(
                        notification_id = item.optInt("notificationId"),
                        user_id = 0,
                        message = item.optString("message"),
                        date = item.optString("date"),
                        read_status = item.optBoolean("readStatus")
                    )
                )
            }
        }
        return notifications
    }
    
    fun markNotificationAsRead(notificationId: Int): Boolean {
        val mutation = """
            mutation MarkAsRead(${'$'}notificationId: Int!) {
                markAsRead(notificationId: ${'$'}notificationId) {
                    notificationId
                    readStatus
                }
            }
        """.trimIndent()
        
        val variables = mapOf("notificationId" to notificationId)
        val response = notificationClient.executeMutation(mutation, variables)
        return response?.optJSONObject("data") != null
    }
    
    // Helper
    private fun parseAuthResponse(response: JSONObject?): AuthResponse? {
        if (response == null) {
            android.util.Log.e("ApiService", "Response is null")
            return null
        }
        
        // Check for GraphQL errors first
        if (response.has("errors")) {
            val errors = response.optJSONArray("errors")
            val errorMessage = if (errors != null && errors.length() > 0) {
                errors.getJSONObject(0).optString("message", "Unknown error")
            } else {
                "GraphQL error occurred"
            }
            android.util.Log.e("ApiService", "GraphQL Error: $errorMessage")
            return AuthResponse(
                token = "",
                user = null,
                message = errorMessage
            )
        }
        
        val data = response.optJSONObject("data")?.optJSONObject("register")
            ?: response.optJSONObject("data")?.optJSONObject("login")
        
        if (data == null) {
            android.util.Log.e("ApiService", "No data in response: ${response.toString()}")
            return AuthResponse(
                token = "",
                user = null,
                message = "Invalid response format"
            )
        }
        
        val token = data.optString("token", "")
        val message = data.optString("message", "")
        val userObj = data.optJSONObject("user")
        
        val user = userObj?.let {
            User(
                user_id = it.optInt("userId"),
                name = it.optString("name", ""),
                email = it.optString("email", ""),
                phone = it.optString("phone", "")
            )
        }
        
        return AuthResponse(
            token = token,
            user = user,
            message = message
        )
    }
    
    data class AuthResponse(
        val token: String,
        val user: User?,
        val message: String
    )
}

