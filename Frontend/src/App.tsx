import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Route,Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Blog from './pages/Blog'
import Signin from './pages/Signin'


const App = () => {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Signup/>} />
      <Route path='/signin' element={<Signin/>} />
      <Route path='/blog' element={<Blog/>} />
      <Route path='/profile' element={<Profile/>} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
