// script.js

function login(userType) {
  const email = document.getElementById(`${userType}-email`).value;
  const password = document.getElementById(`${userType}-password`).value;

  // Enviar a requisição POST para o servidor
  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: email, password: password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Login bem-sucedido') {
      // Redirecionar para a página correta conforme o tipo de usuário
      window.location.href = data.redirectTo;
    } else {
      alert(data.error || 'Erro ao fazer login');
    }
  })
  .catch(error => {
    console.error('Erro na requisição:', error);
    alert('Erro ao tentar fazer login');
  });
}
