import json

def open_json(filename):
    with open(filename,'r', encoding='utf-8') as file:
         data = json.load(file)
         return data
    
json_obj = open_json('cinema.json')

filmes = []
atores = []

map = {
    'filmes' : filmes,
    'atores' : atores
}

o=1
for movie in json_obj['filmes']:

    obj_filme = {
        'id' : o,
        'titulo' : movie['title'],
        'ano' : movie['year'],
        'atores' : movie['cast'],
        'genero' : movie['genres']
    }

    filmes.append(obj_filme)

    for actor in movie['cast']:
        actor_exists = False
        for i, ator in enumerate(atores):
            if ator['nome'] == actor:
                atores[i]['filmes'].append(movie['title'])
                actor_exists = True
                break
            
        if not actor_exists:
            obj_ator = {
                'nome': actor,
                'filmes': [movie['title']]  
            }
            atores.append(obj_ator)

    o+=1

def new_file(filename, content):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(content, f, ensure_ascii=False, indent=4)

new_file('cinema_new.json', map)