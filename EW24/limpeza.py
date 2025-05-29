import json
import re
from datetime import datetime

def clean_currency(value):
    """Converte valores monetários para float"""
    if isinstance(value, (int, float)):
        return float(value)
    
    if not value or value == '':
        return 0.0
    
    # Substitui vírgula por ponto para valores como "3918,75"
    value = value.replace(',', '.')
    
    # Remove possíveis símbolos de moeda e espaços
    value = re.sub(r'[^\d.]', '', value)
    
    try:
        return float(value)
    except ValueError:
        return 0.0

def clean_date(date_str):
    """Converte datas no formato DD/MM/YYYY para ISO (YYYY-MM-DD)"""
    if not date_str or date_str == '':
        return None
    
    try:
        date_obj = datetime.strptime(date_str, '%d/%m/%Y')
        return date_obj.strftime('%Y-%m-%d')
    except ValueError:
        return None

def clean_text(text):
    """Remove espaços extras e normaliza strings"""
    if not text or isinstance(text, (int, float)):
        return text
    
    text = text.strip()
    # Remove múltiplos espaços internos
    text = re.sub(r'\s+', ' ', text)
    return text if text != '' else None

def clean_nipc(nipc):
    """Garante que NIPC é um inteiro"""
    if isinstance(nipc, str):
        nipc = re.sub(r'[^\d]', '', nipc)
    try:
        return int(nipc)
    except (ValueError, TypeError):
        return None

# Carrega o dataset original
with open("csvjson.json", "r", encoding="utf-8") as f:
    contratos = json.load(f)

for contrato in contratos:
    # Normaliza campos de texto
    contrato["tipoprocedimento"] = clean_text(contrato["tipoprocedimento"])
    contrato["objectoContrato"] = clean_text(contrato["objectoContrato"])
    contrato["fundamentacao"] = clean_text(contrato["fundamentacao"])
    contrato["entidade_comunicante"] = clean_text(contrato["entidade_comunicante"])
    
    # Normaliza campo nAnuncio (vazio para None)
    contrato["nAnuncio"] = clean_text(contrato["nAnuncio"])
    
    # Converte datas
    contrato["dataPublicacao"] = clean_date(contrato["dataPublicacao"])
    contrato["dataCelebracaoContrato"] = clean_date(contrato["dataCelebracaoContrato"])
    
    # Converte valores monetários
    contrato["precoContratual"] = clean_currency(contrato["precoContratual"])
    
    # Garante que prazoExecucao é inteiro
    try:
        contrato["prazoExecucao"] = int(contrato["prazoExecucao"])
    except (ValueError, TypeError):
        contrato["prazoExecucao"] = None
    
    # Normaliza NIPC
    contrato["NIPC_entidade_comunicante"] = clean_nipc(contrato["NIPC_entidade_comunicante"])
    
    # Renomeia idcontrato para _id
    contrato["_id"] = contrato.pop("idcontrato")

# Salva o dataset limpo
with open("contratos_clean.json", "w", encoding="utf-8") as f:
    json.dump(contratos, f, ensure_ascii=False, indent=4)

print("Dataset limpo e salvo como 'contratos_limpos.json'")