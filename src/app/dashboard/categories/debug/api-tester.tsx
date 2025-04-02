'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function ApiTester() {
  const [getResult, setGetResult] = useState<{data: any, status: number, statusText: string} | null>(null)
  const [postResult, setPostResult] = useState<{data: any, status: number, statusText: string} | null>(null)
  const [isLoadingGet, setIsLoadingGet] = useState(false)
  const [isLoadingPost, setIsLoadingPost] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Test GET request
  const testGetRequest = async () => {
    try {
      setIsLoadingGet(true)
      setError(null)
      
      console.log('Testing GET request to /api/categories')
      const response = await fetch('/api/categories')
      
      let data
      try {
        data = await response.json()
      } catch (e) {
        data = { error: 'Failed to parse JSON response', text: await response.text() }
      }
      
      setGetResult({
        data,
        status: response.status,
        statusText: response.statusText
      })
      
      console.log('GET request completed with status:', response.status)
    } catch (e) {
      console.error('Error in GET request:', e)
      setError(`GET request error: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setIsLoadingGet(false)
    }
  }
  
  // Test POST request with sample data
  const testPostRequest = async () => {
    try {
      setIsLoadingPost(true)
      setError(null)
      
      // Sample category data for testing
      const testCategory = {
        name: 'Test Category',
        description: 'A test category created via debug API',
        imageUrl: 'https://via.placeholder.com/800x450?text=Test+Category',
        sortOrder: 999
      }
      
      console.log('Testing POST request to /api/categories with data:', testCategory)
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCategory)
      })
      
      let data
      try {
        data = await response.json()
      } catch (e) {
        data = { error: 'Failed to parse JSON response', text: await response.text() }
      }
      
      setPostResult({
        data,
        status: response.status,
        statusText: response.statusText
      })
      
      console.log('POST request completed with status:', response.status)
    } catch (e) {
      console.error('Error in POST request:', e)
      setError(`POST request error: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setIsLoadingPost(false)
    }
  }
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>API Request Tester</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600 mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">GET /api/categories</h3>
              <Button 
                onClick={testGetRequest} 
                disabled={isLoadingGet}
                variant="secondary"
              >
                {isLoadingGet ? 'Testing...' : 'Test GET Request'}
              </Button>
            </div>
            
            {getResult && (
              <div className="mt-2">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold">Status:</span>
                  <span 
                    className={
                      getResult.status >= 200 && getResult.status < 300
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }
                  >
                    {getResult.status} {getResult.statusText}
                  </span>
                </div>
                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-auto max-h-80 text-sm">
                  {JSON.stringify(getResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">POST /api/categories</h3>
              <Button 
                onClick={testPostRequest} 
                disabled={isLoadingPost}
                variant="secondary"
              >
                {isLoadingPost ? 'Testing...' : 'Test POST Request'}
              </Button>
            </div>
            
            {postResult && (
              <div className="mt-2">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold">Status:</span>
                  <span 
                    className={
                      postResult.status >= 200 && postResult.status < 300
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }
                  >
                    {postResult.status} {postResult.statusText}
                  </span>
                </div>
                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-auto max-h-80 text-sm">
                  {JSON.stringify(postResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 