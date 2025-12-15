package com.doswallet.app.api

import com.doswallet.app.utils.SharedPrefsManager
import com.google.gson.Gson
import com.google.gson.JsonObject
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class GraphQLClient(private val baseUrl: String, private val context: android.content.Context) {
    
    private val client = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val original = chain.request()
            val token = SharedPrefsManager.getInstance(context).getToken()
            
            val requestBuilder = original.newBuilder()
                .header("Content-Type", "application/json")
            
            if (token != null) {
                requestBuilder.header("Authorization", "Bearer $token")
            }
            
            chain.proceed(requestBuilder.build())
        }
        .build()
    
    private val gson = Gson()
    private val mediaType = "application/json; charset=utf-8".toMediaType()
    
    fun executeQuery(query: String, variables: Map<String, Any>? = null): JSONObject? {
        val requestBody = try {
            JSONObject().apply {
                put("query", query)
                if (variables != null && variables.isNotEmpty()) {
                    // Convert variables map to JSONObject properly
                    val variablesJson = JSONObject()
                    variables.forEach { (key, value) ->
                        when (value) {
                            is Map<*, *> -> {
                                val nestedJson = JSONObject()
                                (value as Map<*, *>).forEach { (k, v) ->
                                    nestedJson.put(k.toString(), v)
                                }
                                variablesJson.put(key, nestedJson)
                            }
                            is List<*> -> {
                                // Handle lists if needed
                                variablesJson.put(key, gson.toJson(value))
                            }
                            else -> variablesJson.put(key, value)
                        }
                    }
                    put("variables", variablesJson)
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("GraphQLClient", "Error creating request body: ${e.message}", e)
            return null
        }
        
        android.util.Log.d("GraphQLClient", "Request URL: $baseUrl")
        android.util.Log.d("GraphQLClient", "Request Body: ${requestBody.toString()}")
        
        val request = Request.Builder()
            .url(baseUrl)
            .post(requestBody.toString().toRequestBody(mediaType))
            .build()
        
        return try {
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string()
            
            if (responseBody != null) {
                val jsonResponse = JSONObject(responseBody)
                
                // Check for GraphQL errors
                if (jsonResponse.has("errors")) {
                    val errors = jsonResponse.optJSONArray("errors")
                    val errorMessage = if (errors != null && errors.length() > 0) {
                        errors.getJSONObject(0).optString("message", "GraphQL error")
                    } else {
                        "GraphQL error occurred"
                    }
                    android.util.Log.e("GraphQLClient", "GraphQL Error: $errorMessage")
                    android.util.Log.e("GraphQLClient", "Full error: ${errors?.toString()}")
                    return jsonResponse // Return response with errors for handling
                }
                
                if (response.isSuccessful) {
                    android.util.Log.d("GraphQLClient", "Request successful")
                    return jsonResponse
                } else {
                    android.util.Log.e("GraphQLClient", "HTTP Error ${response.code}: $responseBody")
                    return null
                }
            } else {
                android.util.Log.e("GraphQLClient", "Empty response body, HTTP Code: ${response.code}")
                return null
            }
        } catch (e: IOException) {
            android.util.Log.e("GraphQLClient", "Network error: ${e.message}", e)
            e.printStackTrace()
            null
        } catch (e: Exception) {
            android.util.Log.e("GraphQLClient", "Unexpected error: ${e.message}", e)
            e.printStackTrace()
            null
        }
    }
    
    fun executeMutation(mutation: String, variables: Map<String, Any>? = null): JSONObject? {
        return executeQuery(mutation, variables)
    }
    
    companion object {
        const val USER_SERVICE_URL = "http://10.0.2.2:5001/graphql"
        const val WALLET_SERVICE_URL = "http://10.0.2.2:5002/graphql"
        const val TRANSACTION_SERVICE_URL = "http://10.0.2.2:5003/graphql"
        const val NOTIFICATION_SERVICE_URL = "http://10.0.2.2:5004/graphql"
    }
}

