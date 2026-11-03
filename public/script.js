

const formCadastro = document.getElementById('formCadastro');

let idEmEdicao = null;

const botaoSalvar = document.getElementById('botaoSalvar');
const botaoCancelar = document.getElementById('botaoCancelar');

botaoCancelar.style.display = 'none';

function adicionarLinha(registro) {
    const tabela = document.getElementById('tabelaPessoas');
    const linha = document.createElement('tr');

    const celulaNome = document.createElement('td');
    celulaNome.textContent = registro.nome;
    linha.appendChild(celulaNome);

    const celulaIdade = document.createElement('td');
    celulaIdade.textContent = registro.idade;
    linha.appendChild(celulaIdade);

    const celulaDataNascimento = document.createElement('td');
    celulaDataNascimento.textContent = registro.dataNascimento;
    linha.appendChild(celulaDataNascimento);

    const celulaAcoes = document.createElement('td');
    const botaoExcluir = document.createElement('button');
    const botaoEditar = document.createElement('button');

    botaoExcluir.textContent = 'Excluir';
    botaoEditar.textContent = 'Editar';

    celulaAcoes.appendChild(botaoExcluir);
    celulaAcoes.appendChild(botaoEditar);
    linha.appendChild(celulaAcoes);

botaoExcluir.addEventListener('click', function() {
    const registros = JSON.parse(localStorage.getItem('registros')) || [];

    const indice = registros.findIndex(function(item) {
        return item.id === registro.id;
    });

    if (indice !== -1) {
        registros.splice(indice, 1);
        localStorage.setItem('registros', JSON.stringify(registros));
        linha.remove();
    }
});

botaoEditar.addEventListener('click', function() {
    document.getElementById('nome').value = registro.nome;
    document.getElementById('idade').value = registro.idade;
    document.getElementById('dataNascimento').value = registro.dataNascimento;

    idEmEdicao = registro.id;
    botaoSalvar.textContent = 'Salvar alterações';
    botaoCancelar.style.display = 'inline-block';

    console.log('ID selecionado para edição:', idEmEdicao);
});

botaoCancelar.addEventListener('click', function() {
    formCadastro.reset();
    idEmEdicao = null;
    botaoSalvar.textContent = 'Cadastrar';
    botaoCancelar.style.display = 'none';
});

    tabela.appendChild(linha);
}




formCadastro.addEventListener('submit', function(event) {
    event.preventDefault();

    console.log('ID antes de salvar:', idEmEdicao);

    const nome = document.getElementById('nome').value;
    const idade = Number(document.getElementById('idade').value);
    const dataNascimento = document.getElementById('dataNascimento').value;

    const registros = JSON.parse(localStorage.getItem('registros')) || [];

    if (idEmEdicao !== null) {
        const registroExistente = registros.find(function(item) {
            return item.id === idEmEdicao;
            botaoCancelar.style.display = 'none';
        });

        if (registroExistente) {
            registroExistente.nome = nome;
            registroExistente.idade = idade;
            registroExistente.dataNascimento = dataNascimento;
        }

        console.log('Registro atualizado:', registroExistente);

        idEmEdicao = null;
        botaoSalvar.textContent = 'Cadastrar';
    } else {
        const registro = {
            id: crypto.randomUUID(),
            nome,
            idade,
            dataNascimento,
        };

        registros.push(registro);
    }

    localStorage.setItem('registros', JSON.stringify(registros));
    document.getElementById('tabelaPessoas').innerHTML = '';

    registros.forEach(function(registro) {
        adicionarLinha(registro);
    });

    formCadastro.reset();
});



const registrosSalvos = JSON.parse(localStorage.getItem('registros')) || [];

registrosSalvos.forEach(function(registro) {
    if (registro.id == null) {
        registro.id = crypto.randomUUID();
    }

    adicionarLinha(registro);
});

localStorage.setItem('registros', JSON.stringify(registrosSalvos));