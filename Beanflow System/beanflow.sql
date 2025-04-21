CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    razao_social VARCHAR(150),
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    telefone VARCHAR(15),
    email VARCHAR(100)
);

CREATE TABLE cotacoes (
    id SERIAL PRIMARY KEY,
    data_criacao DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) CHECK (
        status IN (
            'Pendente',
            'Aprovado',
            'Recusado',
            'Faturado',
            'Pago',
            'Entregue'
        )
    ),
    prazo DATE GENERATED ALWAYS AS (data_criacao + INTERVAL '10 days') STORED,
    observacoes TEXT,
    cliente_id INT REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE TABLE etapas_cotacao (
    id SERIAL PRIMARY KEY,
    cotacao_id INT REFERENCES cotacoes(id) ON DELETE CASCADE,
    etapa VARCHAR(50) CHECK (
        etapa IN (
            'Realizar orçamento',
            'Ajustar Preço',
            'Enviar cotação',
            'Aprovação do Orçamento',
            'Faturar pedido',
            'Pagamento',
            'Entrega do material'
        )
    ),
    data_etapa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responsavel VARCHAR(100)
);

CREATE TABLE boletos (
    id SERIAL PRIMARY KEY,
    data_criacao DATE DEFAULT CURRENT_DATE,
    vencimento DATE NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    pago BOOLEAN DEFAULT FALSE,
    data_pagamento DATE,
    cliente_id INT REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE VIEW boletos_com_status AS
SELECT 
    b.*,
    CASE
        WHEN pago THEN 'PAGO 🟩'
        WHEN vencimento < CURRENT_DATE THEN 'VENCIDO 🟥'
        WHEN vencimento = CURRENT_DATE THEN 'VENCE HOJE 🟥'
        WHEN vencimento <= CURRENT_DATE + INTERVAL '3 days' THEN 'VENCE EM ATÉ 3 DIAS 🟧'
        WHEN vencimento <= CURRENT_DATE + INTERVAL '7 days' THEN 'VENCE EM ATÉ 7 DIAS 🟨'
        WHEN vencimento <= CURRENT_DATE + INTERVAL '14 days' THEN 'VENCE EM ATÉ 14 DIAS 🟩'
        ELSE 'VENCE EM 15+ DIAS ⬜'
    END AS status
FROM boletos b;

CREATE TABLE tarefas (
    id SERIAL PRIMARY KEY,
    responsavel VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL
);

