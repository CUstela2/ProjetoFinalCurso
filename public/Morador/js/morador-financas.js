document.addEventListener('DOMContentLoaded', function() {
  const moradorId = 1;  // Exemplo, você deve pegar isso do login ou de onde for armazenado
  const apiUrlContas = `http://localhost:3000/financas/${moradorId}`;
  const apiUrlPagamentos = `http://localhost:3000/pagamentos/${moradorId}`;
  
  // Carregar as contas
  fetch(apiUrlContas)
    .then(response => response.json())
    .then(contas => {
      contas.forEach(conta => {
        const billDiv = document.createElement('div');
        billDiv.classList.add('bill');
        
        billDiv.innerHTML = `
          <div class="bill-info">
            <span class="icon ${getIconClass(conta.tipo_conta)}">${getIcon(conta.tipo_conta)}</span>
            <div>
              <p>${conta.nome_conta}</p>
              <small>Venc: ${conta.vencimento}</small>
            </div>
          </div>
          <div class="bill-value">
            <p>R$ ${conta.valor.toFixed(2)}</p>
            <span class="status ${conta.status === 'Pago' ? 'pago' : 'pendente'}">${conta.status}</span>
          </div>
        `;
        
        document.querySelector('.card').appendChild(billDiv);
      });
    })
    .catch(err => console.error('Erro ao carregar as contas:', err));

  // Carregar os pagamentos anteriores
  fetch(apiUrlPagamentos)
    .then(response => response.json())
    .then(pagamentos => {
      pagamentos.forEach(pagamento => {
        const paymentDiv = document.createElement('div');
        paymentDiv.classList.add('bill');
        
        paymentDiv.innerHTML = `
          <div class="bill-info">
            <p>${pagamento.nome_conta} - ${pagamento.data_pagamento}</p>
            <small>${pagamento.data_pagamento}</small>
          </div>
          <div class="bill-value">
            <p>R$ ${pagamento.valor_pago.toFixed(2)}</p>
            <span class="status pago">Pago</span>
          </div>
        `;
        
        document.querySelector('.card').appendChild(paymentDiv);
      });
    })
    .catch(err => console.error('Erro ao carregar pagamentos:', err));

  // Função para gerar o ícone da conta
  function getIconClass(tipo) {
    if (tipo === 'Água') return 'blue';
    if (tipo === 'Luz') return 'yellow';
    if (tipo === 'Gás') return 'red';
    return 'gray';
  }

  function getIcon(tipo) {
    if (tipo === 'Água') return '💧';
    if (tipo === 'Luz') return '⚡';
    if (tipo === 'Gás') return '🔥';
    return '🏠';
  }

  // Lógica para o botão de pagamento (exemplo)
  document.querySelector('.btn-pagar').addEventListener('click', () => {
    const contaId = 1;  // Exemplo
    const valorPago = 200;  // Exemplo
    const dataPagamento = new Date().toISOString().split('T')[0];  // Data atual no formato YYYY-MM-DD

    fetch('http://localhost:3000/pagamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moradorId: moradorId,
        contaId: contaId,
        valorPago: valorPago,
        dataPagamento: dataPagamento,
      })
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
    })
    .catch(err => console.error('Erro ao registrar pagamento:', err));
  });
});
