import express from 'express'

const app = express()
const port = 3000
// Import any additional modules or types you need

// Define the type for the request and response objects
type Request = express.Request
type Response = express.Response

// Define the type for the route handler function
type RouteHandler = (req: Request, res: Response) => void

// Add your routes and route handlers
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!')
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
