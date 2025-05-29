const express = require('express');
const router = express.Router();
const axios = require('axios');
const API_URL = 'http://localhost:16000';

// Funções auxiliares para formatação
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
};

const formatCurrency = (value) => {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
};

// Rota principal - Lista de contratos
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/contratos`);
    res.render('index', {
      title: 'Lista de Contratos',
      contratos: response.data.map(contrato => ({
        ...contrato,
        dataCelebracaoContrato: formatDate(contrato.dataCelebracaoContrato),
        precoContratual: formatCurrency(contrato.precoContratual)
      }))
    });
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {
      message: 'Erro ao carregar contratos',
      error: error.response?.data || error.message
    });
  }
});

// Detalhe do contrato
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/contratos/${req.params.id}`);
    const contrato = response.data;
    
    // Formatar campos específicos para exibição
    const contratoFormatado = {};
    Object.keys(contrato).forEach(key => {
      if (key.includes('data')) {
        contratoFormatado[key] = formatDate(contrato[key]);
      } else if (key.includes('preco')) {
        contratoFormatado[key] = formatCurrency(contrato[key]);
      } else {
        contratoFormatado[key] = contrato[key];
      }
    });

    res.render('contrato', {
      title: `Contrato ${req.params.id}`,
      contrato: contratoFormatado
    });
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {
      message: 'Contrato não encontrado',
      error: error.response?.data || error.message
    });
  }
});

// Página da entidade
router.get('/entidades/:nipc', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/contratos?entidade=${req.params.nipc}`);
    if (response.data.length === 0) {
      return res.render('error', {
        message: 'Nenhum contrato encontrado para esta entidade'
      });
    }
    
    const total = response.data.reduce((sum, c) => sum + (c.precoContratual || 0), 0);
    const contratosFormatados = response.data.map(contrato => ({
      ...contrato,
      dataCelebracaoContrato: formatDate(contrato.dataCelebracaoContrato),
      precoContratual: formatCurrency(contrato.precoContratual)
    }));
    
    res.render('entidade', {
      title: `Entidade ${response.data[0].entidade_comunicante}`,
      entidade: response.data[0].entidade_comunicante,
      nipc: req.params.nipc,
      contratos: contratosFormatados,
      total: formatCurrency(total)
    });
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {
      message: 'Erro ao carregar dados da entidade',
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;