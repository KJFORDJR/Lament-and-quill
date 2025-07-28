// Test the forum stats API and log the response
fetch('/api/forum/stats')
  .then(response => response.json())
  .then(data => {
    console.log('Forum Stats API Response:', data);
    console.log('Active Threads:', data.activeThreads);
    console.log('Daily Posts:', data.dailyPosts); 
    console.log('Online Users:', data.onlineUsers);
  })
  .catch(error => {
    console.error('Error fetching forum stats:', error);
  });
