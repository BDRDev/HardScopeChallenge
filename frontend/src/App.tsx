import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Container, Title, Button } from '@mantine/core'
import { Dashboard } from './pages/Dashboard'

function Home() {
  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="md">
        Hard Scope Challenge
      </Title>
      <Button component={Link} to="/dashboard">
        Open dashboard
      </Button>
    </Container>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
