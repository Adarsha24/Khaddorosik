'use client'
import dynamic from 'next/dynamic'
import swaggerSpec from '@/lib/swagger'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <SwaggerUI
        spec={swaggerSpec}
        docExpansion="list"
        defaultModelsExpandDepth={-1}
        tryItOutEnabled
      />
    </div>
  )
}
