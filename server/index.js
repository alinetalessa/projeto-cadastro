
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const arquivoRegistros = path.join(__dirname, 'records.json');

function lerRegistros() {
    const registros = JSON.parse(
        fs.readFileSync(arquivoRegistros, 'utf8')
    );

    let precisaSalvar = false;

    registros.forEach(pessoa => {
        if (!pessoa.id) {
            pessoa.id = crypto.randomUUID();
            precisaSalvar = true;
        }
    });

    if (precisaSalvar) {
        salvarRegistros(registros);
    }

    return registros;
}

function salvarRegistros(registros) {
    fs.writeFileSync(
        arquivoRegistros,
        JSON.stringify(registros, null, 2)
    );
}

app.use(express.json());

// Teste do servidor
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mensagem: 'Servidor funcionando!'
    });
});

// Listar registros
app.get('/records', (req, res) => {
    const registros = lerRegistros();
    res.json(registros);
});

// Cadastrar pessoa
app.post('/records', (req, res) => {
    const novaPessoa = req.body;
    const registros = lerRegistros();

    const nome = String(novaPessoa.nome || '').trim();
    const idade = novaPessoa.idade;
    const dataNascimento = novaPessoa.dataNascimento;

    if (!nome) {
        return res.status(400).json({
            error: 'Nome é obrigatório'
        });
    }

    if (
        !Number.isInteger(idade) ||
        idade < 0 ||
        idade > 150
    ) {
        return res.status(400).json({
            error: 'Idade inválida'
        });
    }

    if (!dataNascimento) {
        return res.status(400).json({
            error: 'Data de nascimento é obrigatória'
        });
    }

    const duplicado = registros.some(pessoa =>
        pessoa.nome.toLowerCase() === nome.toLowerCase() &&
        pessoa.dataNascimento === dataNascimento
    );

    if (duplicado) {
        return res.status(400).json({
            error: 'Registro já existe'
        });
    }

    const pessoa = {
        id: crypto.randomUUID(),
        nome,
        idade,
        dataNascimento
    };

    registros.push(pessoa);
    salvarRegistros(registros);

    res.status(201).json(pessoa);
});

// Editar pessoa
app.put('/records/:id', (req, res) => {
    const registros = lerRegistros();
    const id = req.params.id;

    const indice = registros.findIndex(
        pessoa => pessoa.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            error: 'Registro não encontrado'
        });
    }

    const nome = String(req.body.nome || '').trim();
    const idade = req.body.idade;
    const dataNascimento = req.body.dataNascimento;

    if (!nome) {
        return res.status(400).json({
            error: 'Nome é obrigatório'
        });
    }

    if (
        !Number.isInteger(idade) ||
        idade < 0 ||
        idade > 150
    ) {
        return res.status(400).json({
            error: 'Idade inválida'
        });
    }

    if (!dataNascimento) {
        return res.status(400).json({
            error: 'Data de nascimento é obrigatória'
        });
    }

    const duplicado = registros.some(pessoa =>
        pessoa.id !== id &&
        pessoa.nome.toLowerCase() === nome.toLowerCase() &&
        pessoa.dataNascimento === dataNascimento
    );

    if (duplicado) {
        return res.status(400).json({
            error: 'Registro já existe'
        });
    }

    registros[indice] = {
        id,
        nome,
        idade,
        dataNascimento
    };

    salvarRegistros(registros);

    res.json(registros[indice]);
});

// Excluir pessoa
app.delete('/records/:id', (req, res) => {
    const registros = lerRegistros();
    const id = req.params.id;

    const indice = registros.findIndex(
        pessoa => pessoa.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            error: 'Registro não encontrado'
        });
    }

    registros.splice(indice, 1);
    salvarRegistros(registros);

    res.json({
        mensagem: 'Registro excluído com sucesso'
    });
});

// Disponibilizar a página e os arquivos públicos
app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
