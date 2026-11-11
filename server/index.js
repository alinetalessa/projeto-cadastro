
const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Verifica se o servidor e o MySQL estão funcionando
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');

        res.json({
            status: 'ok',
            mensagem: 'Servidor funcionando!',
            banco: 'conectado'
        });
    } catch (err) {
        console.error('Erro no MySQL:', err.message);
        res.status(500).json({ error: 'Erro ao conectar ao banco de dados' });
    }
});

// Lista os registros
app.get('/records', async (req, res) => {
    try {
        const [registros] = await db.query(`
            SELECT
                id,
                nome,
                idade,
                DATE_FORMAT(data_nascimento, '%Y-%m-%d') AS dataNascimento
            FROM pessoas
            ORDER BY id DESC
        `);

        res.json(registros);
    } catch (err) {
        console.error('Erro ao listar registros:', err.message);
        res.status(500).json({ error: 'Erro ao listar registros' });
    }
});

// Cadastra uma pessoa
app.post('/records', async (req, res) => {
    try {
        const nome = String(req.body.nome || '').trim();
        const idadeInformada = req.body.idade;
        const idade = Number(idadeInformada);
        const dataNascimento = req.body.dataNascimento;

        if (!nome || idadeInformada == null || String(idadeInformada).trim() === '' ||
            !Number.isInteger(idade) || idade < 0 || idade > 150 ||
            !dataNascimento) {
            return res.status(400).json({ error: 'Dados inválidos' });
        }

        const [duplicados] = await db.execute(
            `SELECT id FROM pessoas
             WHERE LOWER(nome) = LOWER(?) AND data_nascimento = ?
             LIMIT 1`,
            [nome, dataNascimento]
        );

        if (duplicados.length > 0) {
            return res.status(400).json({
                error: 'Esta pessoa já está cadastrada'
            });
        }

        const [resultado] = await db.execute(
            `INSERT INTO pessoas (nome, idade, data_nascimento)
             VALUES (?, ?, ?)`,
            [nome, idade, dataNascimento]
        );

        res.status(201).json({
            id: resultado.insertId,
            nome,
            idade,
            dataNascimento
        });
    } catch (err) {
        console.error('Erro ao cadastrar:', err.message);
        res.status(500).json({ error: 'Erro ao cadastrar pessoa' });
    }
});

// Atualiza uma pessoa
app.put('/records/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const nome = String(req.body.nome || '').trim();
        const idadeInformada = req.body.idade;
        const idade = Number(idadeInformada);
        const dataNascimento = req.body.dataNascimento;

        if (!Number.isInteger(id) || id <= 0 ||
            !nome || idadeInformada == null || String(idadeInformada).trim() === '' ||
            !Number.isInteger(idade) || idade < 0 || idade > 150 ||
            !dataNascimento) {
            return res.status(400).json({ error: 'Dados inválidos' });
        }

        const [existentes] = await db.execute(
            'SELECT id FROM pessoas WHERE id = ?',
            [id]
        );

        if (existentes.length === 0) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }

        const [duplicados] = await db.execute(
            `SELECT id FROM pessoas
             WHERE LOWER(nome) = LOWER(?)
             AND data_nascimento = ?
             AND id <> ?
             LIMIT 1`,
            [nome, dataNascimento, id]
        );

        if (duplicados.length > 0) {
            return res.status(400).json({
                error: 'Esta pessoa já está cadastrada'
            });
        }

        await db.execute(
            `UPDATE pessoas
             SET nome = ?, idade = ?, data_nascimento = ?
             WHERE id = ?`,
            [nome, idade, dataNascimento, id]
        );

        res.json({ id, nome, idade, dataNascimento });
    } catch (err) {
        console.error('Erro ao atualizar:', err.message);
        res.status(500).json({ error: 'Erro ao atualizar pessoa' });
    }
});

// Exclui uma pessoa
app.delete('/records/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const [resultado] = await db.execute(
            'DELETE FROM pessoas WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }

        res.json({ mensagem: 'Registro excluído com sucesso' });
    } catch (err) {
        console.error('Erro ao excluir:', err.message);
        res.status(500).json({ error: 'Erro ao excluir pessoa' });
    }
});

// Disponibiliza os arquivos do front-end
app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
