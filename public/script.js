
const formCadastro = document.getElementById('formCadastro');
const tabela = document.getElementById('tabelaPessoas');

const botaoSalvar = document.getElementById('botaoSalvar');
const botaoCancelar = document.getElementById('botaoCancelar');

let idEmEdicao = null;

const API = '/records';

// Mostrar mensagens de erro
function mostrarErro(mensagem) {
    alert(mensagem);
}

// Fazer requisições à API
async function requisicao(url, opcoes = {}) {
    const resposta = await fetch(url, {
        ...opcoes,
        headers: {
            'Content-Type': 'application/json',
            ...opcoes.headers
        }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.error || 'Ocorreu um erro.');
    }

    return dados;
}

// Criar uma linha na tabela
function adicionarLinha(registro) {
    const linha = document.createElement('tr');

    const celulaNome = document.createElement('td');
    celulaNome.textContent = registro.nome;

    const celulaIdade = document.createElement('td');
    celulaIdade.textContent = registro.idade;

    const celulaData = document.createElement('td');
    celulaData.textContent = registro.dataNascimento;

    const celulaAcoes = document.createElement('td');

    const botaoEditar = document.createElement('button');
    botaoEditar.textContent = 'Editar';
    botaoEditar.type = 'button';

    const botaoExcluir = document.createElement('button');
    botaoExcluir.textContent = 'Excluir';
    botaoExcluir.type = 'button';

    botaoEditar.addEventListener('click', () => {
        document.getElementById('nome').value = registro.nome;
        document.getElementById('idade').value = registro.idade;
        document.getElementById('dataNascimento').value =
            registro.dataNascimento;

        idEmEdicao = registro.id;

        botaoSalvar.textContent = 'Salvar alterações';
        botaoCancelar.style.display = 'inline-block';
    });

    botaoExcluir.addEventListener('click', async () => {
        const confirmar = confirm(
            `Deseja excluir o cadastro de ${registro.nome}?`
        );

        if (!confirmar) return;

        try {
            await requisicao(`${API}/${registro.id}`, {
                method: 'DELETE'
            });

            await carregarRegistros();

            if (idEmEdicao === registro.id) {
                cancelarEdicao();
            }

        } catch (erro) {
            mostrarErro(erro.message);
        }
    });

    celulaAcoes.appendChild(botaoEditar);
    celulaAcoes.appendChild(botaoExcluir);

    linha.appendChild(celulaNome);
    linha.appendChild(celulaIdade);
    linha.appendChild(celulaData);
    linha.appendChild(celulaAcoes);

    tabela.appendChild(linha);
}

// Carregar registros do servidor
async function carregarRegistros() {
    try {
        const registros = await requisicao(API);

        tabela.innerHTML = '';

        registros.forEach(registro => {
            adicionarLinha(registro);
        });

    } catch (erro) {
        mostrarErro('Não foi possível carregar os cadastros: ' + erro.message);
    }
}

// Cancelar edição
function cancelarEdicao() {
    formCadastro.reset();

    idEmEdicao = null;

    botaoSalvar.textContent = 'Cadastrar';
    botaoCancelar.style.display = 'none';
}

botaoCancelar.addEventListener('click', cancelarEdicao);

// Cadastrar ou atualizar
formCadastro.addEventListener('submit', async (event) => {
    event.preventDefault();

    const pessoa = {
        nome: document.getElementById('nome').value.trim(),
        idade: Number(document.getElementById('idade').value),
        dataNascimento: document.getElementById('dataNascimento').value
    };

        if (!pessoa.nome || !pessoa.idade || !pessoa.dataNascimento) {
        mostrarErro('Preencha todos os campos!');
        return;
    }

    
        if (!Number.isInteger(pessoa.idade) || pessoa.idade <= 0) {
        mostrarErro('Digite uma idade válida!');
        return;
    }

    const registros = await requisicao(API);

    const duplicado = registros.find(registro =>
        registro.nome === pessoa.nome &&
        registro.idade === pessoa.idade &&
        registro.dataNascimento === pessoa.dataNascimento &&
        registro.id !== idEmEdicao
    );

if (duplicado) {
    mostrarErro('Esta pessoa já está cadastrada!');
    return;
}

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const nascimento = new Date(pessoa.dataNascimento + 'T00:00:00');

    if (nascimento > hoje) {
        mostrarErro('A data de nascimento não pode ser futura!');
        return;
    }

    try {
        if (idEmEdicao !== null) {
            await requisicao(`${API}/${idEmEdicao}`, {
                method: 'PUT',
                body: JSON.stringify(pessoa)
            });

            alert('Cadastro atualizado com sucesso!');

        } else {
            await requisicao(API, {
                method: 'POST',
                body: JSON.stringify(pessoa)
            });

            alert('Cadastro realizado com sucesso!');
        }

        cancelarEdicao();
        await carregarRegistros();

    } catch (erro) {
        mostrarErro(erro.message);
    }
});

// Carregar os registros quando abrir a página
carregarRegistros();
