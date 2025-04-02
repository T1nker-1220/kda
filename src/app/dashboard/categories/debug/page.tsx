'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import ApiTester from './api-tester'

type Category = Database['public']['Tables']['Category']['Row']

export default function DebugPage() {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [connectionInfo, setConnectionInfo] = useState<{url: string, status: string}>({
    url: '',
    status: 'Checking...'
  })
  const [userInfo, setUserInfo] = useState<any>(null)
  const [userError, setUserError] = useState<string | null>(null)

  // Function to check connection status
  async function checkConnection() {
    try {
      const supabase = createClientComponentClient<Database>()
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'
      setConnectionInfo({ ...connectionInfo, url })
      
      // Simple ping test
      const { data, error } = await supabase.from('Category').select('count()', { count: 'exact' })
      
      if (error) {
        setConnectionInfo({
          url,
          status: `Connection Error: ${error.message}`
        })
        return
      }
      
      setConnectionInfo({
        url,
        status: `Connected successfully. Found ${data.length} items.`
      })
    } catch (e) {
      setConnectionInfo({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
        status: `Exception: ${e instanceof Error ? e.message : String(e)}`
      })
    }
  }

  // Function to fetch user information
  async function fetchUserInfo() {
    try {
      setUserError(null)
      const supabase = createClientComponentClient<Database>()
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setUserError(`Session error: ${sessionError.message}`)
        return
      }
      
      if (!session) {
        setUserInfo({ status: 'No active session found' })
        return
      }
      
      // Get user details
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        setUserError(`User error: ${userError.message}`)
        return
      }
      
      setUserInfo({
        id: user?.id,
        email: user?.email,
        session: {
          expires_at: session?.expires_at,
          token_type: session?.token_type
        }
      })
    } catch (e) {
      setUserError(`Exception: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // Function to fetch categories directly from Supabase
  async function fetchCategoriesFromSupabase() {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClientComponentClient<Database>()
      console.log('Debug: Using Supabase URL', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      // Test RAW SQL query to see if it works differently
      const { data: rawData, error: rawError } = await supabase.rpc('exec_sql', { 
        sql: 'SELECT * FROM "Category" ORDER BY "sortOrder" ASC' 
      })
      
      console.log('Raw SQL query result:', rawData, rawError)
      
      // Normal query
      const { data, error } = await supabase
        .from('Category')
        .select('*')
        .order('sortOrder', { ascending: true })
      
      if (error) {
        console.error('Error fetching from Supabase:', error)
        setError(`Supabase error: ${error.message}`)
        return
      }
      
      console.log('Supabase response data:', data)
      setCategories(data)
    } catch (e) {
      console.error('Exception during Supabase fetch:', e)
      setError(`Exception: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch categories from our API
  async function fetchCategoriesFromAPI() {
    try {
      setApiError(null)
      
      const response = await fetch('/api/categories')
      const responseClone = response.clone()
      
      // Attempt to get the response as JSON
      try {
        const data = await response.json()
        setApiResponse(data)
      } catch (jsonError) {
        // If we can't parse JSON, get the text instead
        const text = await responseClone.text()
        setApiResponse({ text })
        setApiError(`Failed to parse JSON: ${String(jsonError)}. Raw response: ${text}`)
      }
      
      if (!response.ok) {
        setApiError(`API returned status ${response.status}: ${response.statusText}`)
      }
    } catch (e) {
      console.error('Exception during API fetch:', e)
      setApiError(`API error: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  useEffect(() => {
    // Run all checks on component mount
    checkConnection()
    fetchUserInfo()
    fetchCategoriesFromSupabase()
    fetchCategoriesFromAPI()
  }, [])

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Debug Categories</h1>
      
      <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-800">
        <h2 className="text-xl font-semibold mb-4">Connection Information</h2>
        <div className="space-y-2">
          <p><strong>Supabase URL:</strong> {connectionInfo.url}</p>
          <p><strong>Connection Status:</strong> {connectionInfo.status}</p>
          <p><strong>Environment Check:</strong> {process.env.NODE_ENV}</p>
          
          <button 
            onClick={checkConnection} 
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mt-2"
          >
            Recheck Connection
          </button>
        </div>
      </div>
      
      <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-800">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        
        {userError ? (
          <div className="text-red-500 mb-4">
            <p>Error: {userError}</p>
          </div>
        ) : (
          <div>
            <pre className="bg-slate-100 dark:bg-slate-700 p-4 rounded overflow-auto max-h-64">
              {JSON.stringify(userInfo, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-4">
          <button 
            onClick={fetchUserInfo} 
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Refresh Auth Status
          </button>
        </div>
      </div>
      
      <ApiTester />
      
      <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-800">
        <h2 className="text-xl font-semibold mb-4">Direct Supabase Results</h2>
        
        {loading ? (
          <p>Loading from Supabase...</p>
        ) : error ? (
          <div className="text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : (
          <div>
            <p className="mb-2">Found {categories?.length || 0} categories</p>
            <pre className="bg-slate-100 dark:bg-slate-700 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(categories, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-4">
          <button 
            onClick={fetchCategoriesFromSupabase} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Supabase Query
          </button>
        </div>
      </div>
      
      <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-800">
        <h2 className="text-xl font-semibold mb-4">API Results</h2>
        
        <div>
          {apiError && (
            <div className="text-red-500 mb-4">
              <p>API Error: {apiError}</p>
            </div>
          )}
          
          <pre className="bg-slate-100 dark:bg-slate-700 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
        
        <div className="mt-4">
          <button 
            onClick={fetchCategoriesFromAPI} 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Retry API Query
          </button>
        </div>
      </div>
    </div>
  )
} 