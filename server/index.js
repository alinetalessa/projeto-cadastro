const express = require('express');

const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const arquivoRegistros = path.join(__dirname, 'records.json');

function lerRegistros() {
    return JSON.parse(fs.readFileSync(arquivoRegistros, 'utf8'));
}

function salvarRegistros(registros) {
    fs.writeFileSync(
        arquivoRegistros,
        JSON.stringify(registros, null, 2)
    );
}

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mensagem: 'Servidor funcionando!'
    });
});

app.get('/records', (req, res) => {
    const registros = lerRegistros();
    res.json(registros);
});

app.post('/records', (req, res) => {
    // Sua tarefa: criar a constante novaPessoa
    const novaPessoa = req.body;
    const registros = lerRegistros();
    if (!novaPessoa.nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
    }
        if (novaPessoa.idade < 0 || novaPessoa.idade > 150 || !Number.isInteger(novaPessoa.idade)) {
            return res.status(400).json({
            error: 'Idade inválida'
        });
    }
    if (!novaPessoa.dataNascimento) {
    return res.status(400).json({
        error: 'Data de nascimento é obrigatória'
    });
}

const duplicado = registros.some(pessoa =>
    pessoa.nome === novaPessoa.nome &&
    pessoa.dataNascimento === novaPessoa.dataNascimento
);

if (duplicado) {
    return res.status(400).json({
        error: 'Registro já existe'
    });
}

registros.push(novaPessoa);

salvarRegistros(registros);
res.status(201).json(novaPessoa);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});