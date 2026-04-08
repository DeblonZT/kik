"use client"
import React, { use, useEffect } from 'react'

function page() {
  const [posts, setPosts] = React.useState([]);
   useEffect(() => {
    const fecthData = async () => {
      try {
        const data = await fetch('/api/posts');
        const response = await data.json();
        setPosts(response.posts);
        console.log(response.posts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fecthData();
    
    }, [])

  return (
   
    <div>
      <h1>Selamat Datang di Absensi Jurusan TKP</h1>
      <p>Silakan klik tombol di bawah untuk masuk ke halaman login.</p>
      <a href="/login">
        <button className="btn-login">Masuk</button>

        {posts.map(post => (
          <div key={post.id}>{post.nama}</div>
        ))}
      </a>
    </div>
  )
}

export default page
