package com.doswallet.app.utils

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.doswallet.app.models.User

class SharedPrefsManager private constructor(context: Context) {
    
    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val gson = Gson()
    
    companion object {
        private const val PREFS_NAME = "DosWalletPrefs"
        private const val KEY_TOKEN = "token"
        private const val KEY_USER = "user"
        
        @Volatile
        private var instance: SharedPrefsManager? = null
        
        fun getInstance(context: Context): SharedPrefsManager {
            return instance ?: synchronized(this) {
                instance ?: SharedPrefsManager(context.applicationContext).also { instance = it }
            }
        }
    }
    
    fun saveToken(token: String) {
        prefs.edit().putString(KEY_TOKEN, token).apply()
    }
    
    fun getToken(): String? {
        return prefs.getString(KEY_TOKEN, null)
    }
    
    fun saveUser(user: User) {
        val userJson = gson.toJson(user)
        prefs.edit().putString(KEY_USER, userJson).apply()
    }
    
    fun getUser(): User? {
        val userJson = prefs.getString(KEY_USER, null) ?: return null
        return try {
            gson.fromJson(userJson, User::class.java)
        } catch (e: Exception) {
            null
        }
    }
    
    fun clear() {
        prefs.edit().clear().apply()
    }
}

