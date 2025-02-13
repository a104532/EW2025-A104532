import json

def open_json(filename):
    with open(filename,'r', encoding='utf-8') as file:
         data = json.load(file)
         return data

reparacoes = []
intervencoes = []
viaturas = []

map = {
    "reparacoes": reparacoes,
    "intervencoes": intervencoes,
    "viaturas": viaturas
}

json_obj = open_json('dataset_reparacoes.json')

for reparacao in json_obj['reparacoes']:
    reparacoes.append(reparacao)
    
    for intervencao in reparacao['intervencoes']:
        if intervencao not in intervencoes:
            intervencoes.append(intervencao)
    
    viaturas.append(reparacao['viatura'])

def new_file(filename, content):
    f = open(filename, 'w', encoding='utf-8')
    f.write(content)
    f.close()

def new_file2(filename, content):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(content, f, ensure_ascii=False, indent=4)

new_file2("new_dataset.json", map)

print("Ficheiro criado com sucesso!")
